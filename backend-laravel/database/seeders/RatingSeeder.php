<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/read_story_app.ratings.json');
        $jsonData = json_decode(file_get_contents($jsonPath), true);

        // Lấy userId của email cụ thể
        $targetEmail = 'vonghiaky12a7@gmail.com';
        $specificUserId = DB::table('users')->where('email', $targetEmail)->value('id');

        // Lấy danh sách userId và storyId
        $userIds = DB::table('users')->pluck('id')->toArray();
        $storyIds = DB::table('stories')->pluck('storyId')->toArray();

        if (!$specificUserId) {
            echo "Không tìm thấy user có email: {$targetEmail}. Chọn user ngẫu nhiên.\n";
        }

        foreach ($jsonData as $item) {
            $userId = $specificUserId ?? $userIds[array_rand($userIds)];

            // Random storyId, đảm bảo không bị duplicate
            do {
                $storyId = $storyIds[array_rand($storyIds)];
                $exists = DB::table('ratings')
                    ->where('userId', $userId)
                    ->where('storyId', $storyId)
                    ->exists();
            } while ($exists); // Nếu bị trùng thì random lại

            // Chèn dữ liệu mới không bị trùng
            DB::table('ratings')->insert([
                'id' => Str::uuid()->toString(),
                'userId' => $userId,
                'storyId' => $storyId,
                'rating' => $item['rating'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}