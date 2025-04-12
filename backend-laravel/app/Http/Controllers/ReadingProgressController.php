<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReadingProgress;
use Ramsey\Uuid\Uuid;

class ReadingProgressController extends Controller
{
    public function updateProgress(Request $request)
    {
        $validated = $request->validate([
            'storyId' => 'required|uuid|exists:stories,storyId',
            'lastChapterId' => 'nullable|uuid|exists:chapters,chapterId',
            'lastPage' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $progress = ReadingProgress::updateOrCreate(
            [
                'userId' => $user->id,
                'storyId' => $validated['storyId'],
            ],
            [
                'lastChapterId' => $validated['lastChapterId'],
                'lastPage' => $validated['lastPage'],
                'lastReadAt' => now(),
            ]
        );

        return response()->json([
            'message' => 'Reading progress updated successfully',
            'progress' => $progress
        ], 200);
    }

    public function getProgress(Request $request, $storyId)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!Uuid::isValid($storyId)) {
            return response()->json(['message' => 'Invalid story ID'], 400);
        }

        $progress = ReadingProgress::where('userId', $user->id)
            ->where('storyId', $storyId)
            ->first();

        if (!$progress) {
            return response()->json([
                'message' => 'No reading progress found',
                'progress' => null
            ], 200);
        }

        return response()->json([
            'message' => 'Reading progress retrieved successfully',
            'progress' => $progress
        ], 200);
    }
}
