<?php

namespace App\Http\Controllers;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    // Upload một ảnh
    public function uploadSingleImage(Request $request)
    {
        try {
            // Validate file
            $request->validate([
                'image' => 'required|image|max:10240' // Tối đa 10MB
            ]);

            // Upload lên Cloudinary
            $uploadedFile = $request->file('image');
            $result = Cloudinary::upload($uploadedFile->getRealPath(), [
                'folder' => 'uploads/single', // Thư mục trên Cloudinary
                'transformation' => [
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ]);

            // Lấy URL của ảnh
            $imageUrl = $result->getSecurePath();
            $publicId = $result->getPublicId();

            return response()->json([
                'success' => true,
                'url' => $imageUrl,
                'public_id' => $publicId,
                'message' => 'Upload ảnh thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage()
            ], 500);
        }
    }

    // Upload nhiều ảnh
    public function uploadMultipleImages(Request $request)
    {
        try {
            // Validate files
            $request->validate([
                'images' => 'required|array',
                'images.*' => 'image|max:10240' // Tối đa 10MB mỗi ảnh
            ]);

            $uploadedImages = [];
            $files = $request->file('images');

            // Upload từng ảnh lên Cloudinary
            foreach ($files as $file) {
                $result = Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'uploads/multiple',
                    'transformation' => [
                        'quality' => 'auto',
                        'fetch_format' => 'auto'
                    ]
                ]);

                $uploadedImages[] = [
                    'url' => $result->getSecurePath(),
                    'public_id' => $result->getPublicId()
                ];
            }

            return response()->json([
                'success' => true,
                'images' => $uploadedImages,
                'message' => 'Upload nhiều ảnh thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage()
            ], 500);
        }
    }
}