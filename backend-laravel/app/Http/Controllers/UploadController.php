<?php

namespace App\Http\Controllers;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;

class UploadController extends Controller
{
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
                // Lấy tên file từ FormData (customFileName đã được gửi từ client)
                $originalFileName = $file->getClientOriginalName();
                // Loại bỏ phần mở rộng file để tạo public_id
                $fileNameWithoutExtension = pathinfo($originalFileName, PATHINFO_FILENAME);
                // Tạo public_id tùy chỉnh
                $publicId = "uploads/multiple/{$fileNameWithoutExtension}";

                $result = Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'uploads/multiple',
                    'public_id' => $fileNameWithoutExtension, // Đặt public_id tùy chỉnh
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

    // Upload một ảnh
    public function uploadSingleImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|max:10240'
            ]);

            $uploadedFile = $request->file('image');
            $result = Cloudinary::upload($uploadedFile->getRealPath(), [
                'folder' => 'uploads/single',
                'transformation' => [
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ]);

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
}
