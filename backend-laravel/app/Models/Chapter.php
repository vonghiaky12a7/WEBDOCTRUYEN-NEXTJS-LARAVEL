<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    use HasFactory;

    protected $table = 'chapters';
    protected $primaryKey = 'chapterId'; // Khóa chính
    public $incrementing = false; // Khóa chính không tự tăng
    protected $keyType = 'string'; // Kiểu dữ liệu của khóa chính
    public $timestamps = false; // Không sử dụng timestamps


    protected $fillable = [
        'chapterId',
        'storyId',
        'chapterNumber',
        'title',
        'imageUrls'
    ];

    // Cast imageUrls từ JSON string sang array khi lấy từ DB
    protected $casts = [
        'imageUrls' => 'array'
    ];

    public function story()
    {
        return $this->belongsTo(Story::class, 'storyId', 'storyId');
    }

    // Accessor để lấy imageUrls dưới dạng array
    public function getImageUrlsAttribute($value)
    {
        // Nếu giá trị là JSON hợp lệ, trả về mảng
        return json_decode($value, true) ?? [];
    }

    // Mutator để tự động chuyển đổi imageUrls thành JSON trước khi lưu
    public function setImageUrlsAttribute($value)
    {
        if (is_string($value)) {
            // Nếu là string chứa URLs ngăn cách bởi dấu phẩy
            $urls = array_map('trim', explode(',', $value));
            $this->attributes['imageUrls'] = json_encode($urls);
        } else if (is_array($value)) {
            // Nếu đã là array
            $this->attributes['imageUrls'] = json_encode($value);
        } else {
            // Nếu không phải string hay array, chuyển thành mảng rỗng hoặc xử lý theo yêu cầu
            $this->attributes['imageUrls'] = json_encode([]);
        }
    }
}
