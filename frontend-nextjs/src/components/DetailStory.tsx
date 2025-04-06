"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LoadingError from "./LoadingError";
import { Story } from "../models/story";
import Image from "next/image";
import { StoryService } from "../services/storyService";
import RatingStars from "./RatingStars";
import Link from "next/link";
import { ChapterService } from "../services/chapterService";
import { Chapter } from "../models/chapter";
import { useAuthStore } from "@/stores/authStore";
import { Heart } from "lucide-react";
import { FavoriteService } from "../services/favoriteService";
import { CommentService } from "../services/commentService";
import { Comment } from "../models/comment";

function DetailStory() {
  const { id } = useParams() as { id?: string };
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newestStories, setNewestStories] = useState<Story[]>([]);
  const [topStories, setTopStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<"newest" | "top">("newest");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuthStore();
  const userId = user?.id || null;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          storyData,
          newestData,
          topStoriesData,
          chaptersData,
          favoriteStatus,
          commentsData,
        ] = await Promise.all([
          StoryService.fetchStoryById(id),
          StoryService.fetchStoriesDesc({ limit: 7, sort: "newest" }),
          StoryService.getAllRatingsDESC(7),
          ChapterService.getChaptersByStory(id),
          userId
            ? FavoriteService.checkFavorite(userId, id)
            : Promise.resolve(false),
          CommentService.getComments(id),
        ]);

        setStory(storyData);
        setNewestStories(newestData);
        setTopStories(topStoriesData);
        setChapters(chaptersData);
        setIsLiked(favoriteStatus);
        setComments(commentsData);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  const handleFavoriteToggle = async () => {
    if (!userId || !id) {
      alert("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      return;
    }
    try {
      if (isLiked) {
        await FavoriteService.removeFavorite(userId, id);
        setIsLiked(false);
      } else {
        await FavoriteService.addFavorite(userId, id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái yêu thích:", error);
      alert("Đã xảy ra lỗi khi cập nhật trạng thái yêu thích!");
    }
  };

  const handleAddComment = async () => {
    if (!userId || !id) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }
    if (!newComment.trim()) {
      alert("Vui lòng nhập nội dung bình luận!");
      return;
    }

    try {
      const addedComment = await CommentService.addComment(
        userId,
        id,
        newComment
      );
      setComments([addedComment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      alert("Đã xảy ra lỗi khi thêm bình luận!");
    }
  };

  const storiesToShow = activeTab === "newest" ? newestStories : topStories;

  return (
    <section className="my-6 px-4 sm:my-10 sm:px-6 lg:px-8">
      <LoadingError isLoading={isLoading} error={error} />
      {story && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Thông tin truyện */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-lg flex flex-col sm:flex-row gap-6">
              <Image
                src={story.coverImage}
                alt={story.title}
                width={160}
                height={240}
                className="object-cover rounded-lg w-full sm:w-40 md:w-48 h-60 md:h-72 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-black text-2xl md:text-3xl font-bold truncate">
                    {story.title}
                  </h1>
                  <Heart
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      isLiked
                        ? "text-red-500 fill-red-500"
                        : "text-gray-500 hover:text-red-400"
                    }`}
                    onClick={handleFavoriteToggle}
                  />
                </div>
                <p className="text-base text-gray-600 mb-2">
                  <span className="font-semibold">Tác giả:</span> {story.author}
                </p>
                <p className="text-base text-gray-700 mb-3 line-clamp-3">
                  {story.description}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  <span className="font-semibold">Ngày phát hành:</span>{" "}
                  {new Date(story.releaseDate).toLocaleDateString("vi-VN")}
                </p>
                <RatingStars
                  storyId={story.storyId}
                  userId={userId || ""}
                  initialRating={story.rating}
                  ratingCount={story.ratingCount}
                />
              </div>
            </div>

            {/* Danh sách chương */}
            <div className="bg-white p-6 border rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                📖 Danh sách chương
              </h2>
              {chapters.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {chapters.map((chapter) => (
                    <li
                      key={chapter.chapterId} // Key duy nhất
                      className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 px-4 rounded-lg transition-all duration-200"
                    >
                      <Link
                        href={`/stories/${story.storyId}/chapter/${chapter.chapterId}`}
                        className="text-blue-600 font-medium hover:underline text-base flex-grow truncate"
                      >
                        {`Chương ${chapter.chapterNumber}: ${chapter.title}`}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4 text-base">
                  Chưa có chương nào được thêm.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar: Top truyện và bình luận */}
          <div className="flex flex-col space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-lg">
              <div className="flex border-b justify-center sticky top-0 bg-white z-10 mb-4">
                {["newest", "top"].map((tab) => (
                  <button
                    key={tab} // Key duy nhất cho tab
                    className={`px-4 py-2 text-base font-semibold ${
                      activeTab === tab
                        ? "border-b-2 border-purple-600 text-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab(tab as "newest" | "top")}
                  >
                    {tab === "newest" ? "Mới nhất" : "Top truyện"}
                  </button>
                ))}
              </div>
              <ul className="space-y-3 max-h-[430px] overflow-y-auto">
                {storiesToShow.map((storyItem) => (
                  <Link
                    key={storyItem.storyId}
                    href={`/stories/${storyItem.storyId}`}
                    passHref
                  >
                    <li className="flex items-center space-x-3 border-b pb-2 cursor-pointer hover:bg-gray-50 transition">
                      <span
                        className={`text-base font-bold ${
                          storiesToShow.indexOf(storyItem) < 3
                            ? "text-red-500"
                            : "text-gray-600"
                        }`}
                      >
                        {String(storiesToShow.indexOf(storyItem) + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>
                      <Image
                        src={storyItem.coverImage}
                        alt={storyItem.title}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover w-10 h-10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold text-sm truncate">
                          {storyItem.title}
                        </p>
                        {activeTab === "newest" && (
                          <p className="text-gray-500 text-xs">
                            {new Date(storyItem.releaseDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        )}
                      </div>
                      {activeTab === "top" && (
                        <p className="text-gray-600 text-xs whitespace-nowrap">
                          ⭐{" "}
                          {typeof storyItem.rating === "number"
                            ? storyItem.rating.toFixed(1)
                            : "0.0"}{" "}
                          ({storyItem.ratingCount || 0})
                        </p>
                      )}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>

            {/* Bình luận */}
            <div className="bg-white p-6 rounded-lg border shadow-lg">
              <h2 className="text-xl font-semibold text-black mb-4">
                Bình luận
              </h2>
              {userId && (
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Gửi
                  </button>
                </div>
              )}
              {comments.length > 0 ? (
                <ul className="space-y-4">
                  {comments.map((comment) => (
                    <li
                      key={comment.commentId}
                      className="flex items-start space-x-3"
                    >
                      <Image
                        src={
                          comment.user?.avatarPath ||
                          "https://th.bing.com/th/id/OIP.hIWnBO3sop9nHiu1GQzNrAHaHa?rs=1&pid=ImgDetMain"
                        }
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full w-10 h-10"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {comment.user?.username || "Ẩn danh"}
                        </p>
                        <p className="text-gray-700">{comment.content}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(comment.created_at || "").toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-base">
                  Chưa có bình luận nào.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DetailStory;
