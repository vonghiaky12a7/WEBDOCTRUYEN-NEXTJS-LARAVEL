<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\Chapter;
use App\Models\Rating;
use App\Models\Favorite;
use App\Models\Comment;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoryController extends Controller
{
    /**
     * Lấy tất cả truyện
     */
    public function index()
    {
        $stories = Story::all();

        // Thêm thông tin về số chương và rating cho mỗi truyện
        $stories = $stories->map(function ($story) {
            $chaptersCount = Chapter::where('storyId', $story->storyId)->count();
            $ratings = Rating::where('storyId', $story->storyId)->get();
            $avgRating = $ratings->count() > 0 ? round($ratings->avg('rating'), 1) : null;


            // Lấy danh sách genreIds
            $genreIds = DB::table('story_genres')
                ->where('storyId', $story->storyId)
                ->pluck('genreId')
                ->toArray();

            return [
                'storyId' => $story->storyId,
                'title' => $story->title,
                'author' => $story->author,
                'description' => $story->description,
                'coverImage' => $story->coverImage,
                'genreIds' => $genreIds,
                'chapters' => $chaptersCount,
                'releaseDate' => $story->releaseDate,
                'rating' => $avgRating,
                'ratingCount' => $ratings->count(),
            ];
        });

        return response()->json($stories);
    }

    /**
     * Lấy chi tiết truyện theo ID
     */
    public function show($storyId)
    {
        $story = Story::where('storyId', $storyId)->first();

        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        $chaptersCount = Chapter::where('storyId', $storyId)->count();
        $ratings = Rating::where('storyId', $storyId)->get();
        $avgRating = $ratings->count() > 0 ? $ratings->avg('rating') : null;

        // Lấy danh sách genreIds
        $genreIds = DB::table('story_genres')
            ->where('storyId', $storyId)
            ->pluck('genreId')
            ->toArray();

        $result = [
            'storyId' => $story->storyId,
            'title' => $story->title,
            'author' => $story->author,
            'description' => $story->description,
            'coverImage' => $story->coverImage,
            'genreIds' => $genreIds,
            'chapters' => $chaptersCount,
            'releaseDate' => $story->releaseDate,
            'rating' => $avgRating,
            'ratingCount' => $ratings->count(),
        ];

        return response()->json($result);
    }

    /**
     * Tạo truyện mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'description' => 'required|string',
            'coverImage' => 'required|string',
            'genreIds' => 'required|array',
            'genreIds.*' => 'integer|exists:genres,genreId',
            'releaseDate' => 'required|date',
        ]);

        // Tạo storyId ngẫu nhiên
        $storyId = Str::uuid()->toString();

        // Tạo truyện mới
        $story = Story::create([
            'title' => $request->title,
            'author' => $request->author,
            'description' => $request->description,
            'coverImage' => $request->coverImage,
            'releaseDate' => $request->releaseDate,
        ]);

        $story->save();

        // Thêm thể loại cho truyện
        foreach ($request->genreIds as $genreId) {
            DB::table('story_genres')->insert([
                'storyId' => $story->storyId,
                'genreId' => $genreId,
            ]);
        }

        return response()->json([
            'message' => 'Story created successfully',
            'storyId' => $storyId
        ], 201);
    }

    /**
     * Cập nhật thông tin truyện
     */
    public function update(Request $request, $storyId)
    {
        $story = Story::where('storyId', $storyId)->first();

        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        $request->validate([
            'title' => 'string',
            'author' => 'string',
            'description' => 'string',
            'coverImage' => 'string',
            'genreIds' => 'array',
            'genreIds.*' => 'integer|exists:genres,genreId',
            'releaseDate' => 'date',
        ]);

        // Cập nhật thông tin truyện
        if ($request->has('title')) $story->title = $request->title;
        if ($request->has('author')) $story->author = $request->author;
        if ($request->has('description')) $story->description = $request->description;
        if ($request->has('coverImage')) $story->coverImage = $request->coverImage;
        if ($request->has('releaseDate')) $story->releaseDate = $request->releaseDate;

        $story->save();

        // Cập nhật thể loại nếu có
        if ($request->has('genreIds')) {
            // Xóa tất cả thể loại cũ
            DB::table('story_genres')->where('storyId', $storyId)->delete();

            // Thêm thể loại mới
            foreach ($request->genreIds as $genreId) {
                DB::table('story_genres')->insert([
                    'storyId' => $storyId,
                    'genreId' => $genreId,
                ]);
            }
        }

        return response()->json(['message' => 'Story updated successfully']);
    }

    /**
     * Xóa truyện
     */
    public function destroy($storyId)
    {
        $story = Story::where('storyId', $storyId)->first();

        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        // Xóa truyện (các bảng liên quan sẽ tự động xóa nhờ foreign key cascade)
        $story->delete();

        return response()->json(['message' => 'Story deleted successfully']);
    }

    /**
     * Lấy danh sách truyện với các tham số lọc
     */
    public function list(Request $request)
    {
        $query = Story::query();

        // Lọc theo tiêu đề
        if ($request->has('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        // Lọc theo thể loại
        if ($request->has('genres')) {
            $genreIds = explode(',', $request->genres);
            $query->whereHas('genres', function ($q) use ($genreIds) {
                $q->whereIn('genres.genreId', $genreIds);
            });
        }

        // Sắp xếp
        $sortBy = $request->sortBy ?? 'newest';

        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('releaseDate', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('releaseDate', 'desc');
                break;
        }

        // Giới hạn số lượng
        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        // Nếu là trang chủ, chỉ lấy truyện mới nhất với giới hạn số lượng
        if ($request->has('isHome') && $request->isHome === 'true') {
            $query->orderBy('releaseDate', 'desc');
            $query->limit($request->limit ?? 12);
        }

        $stories = $query->get();

        // Thêm thông tin về số chương và rating cho mỗi truyện
        $storiesWithData = $stories->map(function ($story) {
            $chaptersCount = Chapter::where('storyId', $story->storyId)->count();
            $ratings = Rating::where('storyId', $story->storyId)->get();
            $avgRating = $ratings->count() > 0 ? $ratings->avg('rating') : null;

            // Lấy danh sách genreIds
            $genreIds = DB::table('story_genres')
                ->where('storyId', $story->storyId)
                ->pluck('genreId')
                ->toArray();

            return [
                'storyId' => $story->storyId,
                'title' => $story->title,
                'author' => $story->author,
                'description' => $story->description,
                'coverImage' => $story->coverImage,
                'genreIds' => $genreIds,
                'chapters' => $chaptersCount,
                'releaseDate' => $story->releaseDate,
                'rating' => $avgRating,
                'ratingCount' => $ratings->count(),
            ];
        });

        // Sắp xếp
        $sortBy = $request->sortBy ?? 'newest';

        switch ($sortBy) {
            case 'oldest':
                $sortedStories = $storiesWithData->sortBy('releaseDate');
                break;
            case 'rating':
                $sortedStories = $storiesWithData->sortByDesc('rating');
                break;
            case 'newest':
            default:
                $sortedStories = $storiesWithData->sortByDesc('releaseDate');
                break;
        }

        // Giới hạn số lượng nếu cần
        if ($request->has('limit')) {
            $sortedStories = $sortedStories->take($request->limit);
        }

        return response()->json($sortedStories->values());
    }

    /**
     * Lấy top truyện theo rating
     */
    public function top(Request $request)
    {
        $limit = $request->limit ?? 7;

        // Lấy tất cả truyện
        $stories = Story::all();

        // Tính toán rating trung bình cho mỗi truyện
        $storiesWithRating = $stories->map(function ($story) {
            $chaptersCount = Chapter::where('storyId', $story->storyId)->count();
            $ratings = Rating::where('storyId', $story->storyId)->get();
            $avgRating = $ratings->count() > 0 ? $ratings->avg('rating') : 0;

            // Lấy danh sách genreIds
            $genreIds = DB::table('story_genres')
                ->where('storyId', $story->storyId)
                ->pluck('genreId')
                ->toArray();

            return [
                'storyId' => $story->storyId,
                'title' => $story->title,
                'author' => $story->author,
                'description' => $story->description,
                'coverImage' => $story->coverImage,
                'genreIds' => $genreIds,
                'chapters' => $chaptersCount,
                'releaseDate' => $story->releaseDate,
                'rating' => $avgRating,
                'ratingCount' => $ratings->count(),
            ];
        });

        // Sắp xếp theo rating giảm dần
        $sortedStories = $storiesWithRating->sortByDesc('rating');

        // Giới hạn số lượng trả về
        $result = $sortedStories->take($limit)->values();

        return response()->json($result);
    }

    /**
     * Lấy tất cả chapter của story
     */
    public function getChapters($storyId)
    {
        $chapters = Chapter::where('storyId', $storyId)
            ->orderBy('chapterNumber', 'asc')
            ->get();

        return response()->json($chapters);
    }

    /**
     * Lấy chi tiết chapter theo ID
     */
    public function getChapter($storyId, $chapterId)
    {
        $chapter = Chapter::where('storyId', $storyId)
            ->where('chapterId', $chapterId)
            ->first();

        if (!$chapter) {
            return response()->json(['message' => 'Chapter not found'], 404);
        }

        return response()->json($chapter);
    }

    /**
     * Lấy danh sách đánh giá của một truyện
     */
    public function getRatings($storyId)
    {
        $ratings = Rating::where('storyId', $storyId)->get();

        return response()->json([
            'ratings' => $ratings,
            'average' => $ratings->avg('rating'),
            'count' => $ratings->count()
        ]);
    }

    /**
     * Lấy danh sách bình luận của một truyện
     */
    public function getComments($storyId)
    {
        $comments = Comment::where('storyId', $storyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'comments' => $comments
        ]);
    }

    /**
     * Thêm truyện vào danh sách yêu thích
     */
    public function addToFavorites(Request $request)
    {
        $validated = $request->validate([
            'userId' => 'required|string',
            'storyId' => 'required|string|exists:stories,storyId',
        ]);

        $favorite = Favorite::firstOrCreate([
            'userId' => $validated['userId'],
            'storyId' => $validated['storyId'],
        ]);

        return response()->json([
            'message' => 'Đã thêm truyện vào danh sách yêu thích',
            'favorite' => $favorite
        ]);
    }

    /**
     * Xóa truyện khỏi danh sách yêu thích
     */
    public function removeFromFavorites(Request $request)
    {
        $validated = $request->validate([
            'userId' => 'required|string',
            'storyId' => 'required|string',
        ]);

        $deleted = Favorite::where('userId', $validated['userId'])
            ->where('storyId', $validated['storyId'])
            ->delete();

        return response()->json([
            'message' => 'Đã xóa truyện khỏi danh sách yêu thích',
            'success' => $deleted > 0
        ]);
    }

    /**
     * Lấy danh sách truyện yêu thích của người dùng
     */
    public function getFavorites($userId)
    {
        $favorites = Favorite::where('userId', $userId)
            ->join('stories', 'favorites.storyId', '=', 'stories.storyId')
            ->select('stories.*', 'favorites.created_at as favorited_at')
            ->get();

        return response()->json([
            'favorites' => $favorites
        ]);
    }

    /**
     * Thêm bình luận mới
     */
    public function addComment(Request $request)
    {
        $validated = $request->validate([
            'userId' => 'required|string',
            'storyId' => 'required|string|exists:stories,storyId',
            'content' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'userId' => $validated['userId'],
            'storyId' => $validated['storyId'],
            'content' => $validated['content'],
        ]);

        return response()->json([
            'message' => 'Đã thêm bình luận mới',
            'comment' => $comment
        ]);
    }

    /**
     * Thêm đánh giá mới
     */
    public function addRating(Request $request)
    {
        $validated = $request->validate([
            'userId' => 'required|string',
            'storyId' => 'required|string|exists:stories,storyId',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $rating = Rating::updateOrCreate(
            [
                'userId' => $validated['userId'],
                'storyId' => $validated['storyId'],
            ],
            [
                'rating' => $validated['rating'],
            ]
        );

        return response()->json([
            'message' => 'Đã thêm đánh giá mới',
            'rating' => $rating
        ]);
    }

    /**
     * Store a new chapter for a story
     */
    public function storeChapter(Request $request, $storyId)
    {
        $story = Story::where('storyId', $storyId)->first();

        if (!$story) {
            return response()->json(['message' => 'Story not found'], 404);
        }

        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'chapterNumber' => 'required|integer|min:1',
        ]);

        $chapter = Chapter::create([
            'storyId' => $storyId,
            'title' => $request->title,
            'content' => $request->content,
            'chapterNumber' => $request->chapterNumber,
            'chapterId' => Str::uuid()->toString(),
        ]);

        return response()->json([
            'message' => 'Chapter created successfully',
            'chapter' => $chapter
        ], 201);
    }

    /**
     * Update an existing chapter
     */
    public function updateChapter(Request $request, $storyId, $chapterId)
    {
        $chapter = Chapter::where('storyId', $storyId)
            ->where('chapterId', $chapterId)
            ->first();

        if (!$chapter) {
            return response()->json(['message' => 'Chapter not found'], 404);
        }

        $request->validate([
            'title' => 'string',
            'content' => 'string',
            'chapterNumber' => 'integer|min:1',
        ]);

        if ($request->has('title')) $chapter->title = $request->title;
        if ($request->has('content')) $chapter->content = $request->content;
        if ($request->has('chapterNumber')) $chapter->chapterNumber = $request->chapterNumber;

        $chapter->save();

        return response()->json([
            'message' => 'Chapter updated successfully',
            'chapter' => $chapter
        ]);
    }

    /**
     * Delete a chapter
     */
    public function destroyChapter($storyId, $chapterId)
    {
        $chapter = Chapter::where('storyId', $storyId)
            ->where('chapterId', $chapterId)
            ->first();

        if (!$chapter) {
            return response()->json(['message' => 'Chapter not found'], 404);
        }

        $chapter->delete();

        return response()->json(['message' => 'Chapter deleted successfully']);
    }
}