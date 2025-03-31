<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UploadController;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login/mobile', [AuthController::class, 'loginMobile']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
    Route::get('/verify-reset-token/{email}/{token}', [AuthController::class, 'verifyResetToken']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/verify-token', [AuthController::class, 'verifyToken']);


    // User routes with admin middleware
    Route::middleware('admin')->prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });
});

Route::post('/upload/single', [UploadController::class, 'uploadSingleImage']);
Route::post('/upload/multiple', [UploadController::class, 'uploadMultipleImages']);
Route::get('/test-cloudinary-config', function () {
    dd(config('cloudinary.cloud_url'));
});

// Public story routes
Route::prefix('stories')->group(function () {
    Route::get('/', [StoryController::class, 'index']);
    Route::get('/list', [StoryController::class, 'list']);
    Route::get('/top', [StoryController::class, 'top']);
    Route::get('/{storyId}', [StoryController::class, 'show']);
    Route::get('/{storyId}/chapters', [StoryController::class, 'getChapters']);
    Route::get('/{storyId}/chapter/{chapterId}', [StoryController::class, 'getChapter']);
    Route::get('/{storyId}/ratings', [StoryController::class, 'getRatings']);
    Route::get('/{storyId}/comments', [StoryController::class, 'getComments']);
});

// Protected story routes
Route::middleware('auth:sanctum')->prefix('stories')->group(function () {
    Route::post('/favorite', [StoryController::class, 'addToFavorites']);
    Route::delete('/favorite', [StoryController::class, 'removeFromFavorites']);
    Route::get('/favorites/{userId}', [StoryController::class, 'getFavorites']);
    Route::post('/comment', [StoryController::class, 'addComment']);
    Route::post('/rating', [StoryController::class, 'addRating']);

    // Admin-only story operations
    Route::middleware('admin')->group(function () {
        Route::post('/', [StoryController::class, 'store']);
        Route::put('/{storyId}', [StoryController::class, 'update']);
        Route::delete('/{storyId}', [StoryController::class, 'destroy']);

        // Chapter admin routes
        Route::post('/{storyId}/chapters', [StoryController::class, 'storeChapter']);
        Route::put('/{storyId}/chapter/{chapterId}', [StoryController::class, 'updateChapter']);
        Route::delete('/{storyId}/chapter/{chapterId}', [StoryController::class, 'destroyChapter']);
    });
});

// Genre routes
Route::prefix('genres')->group(function () {
    Route::get('/', [GenreController::class, 'index']);
    Route::get('/{genreId}', [GenreController::class, 'show']);

    // Admin-only genre operations
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/', [GenreController::class, 'store']);
        Route::put('/{idgenreId}', [GenreController::class, 'update']);
        Route::delete('/{genreId}', [GenreController::class, 'destroy']);
    });
});
