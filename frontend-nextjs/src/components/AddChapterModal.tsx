"use client";

import { useState } from "react";
import { ChapterService } from "@/services/chapterService";
import { ImgService } from "@/services/imgService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function AddChapterModal({
  storyId,
  storyName,
  initialChapterNumber,  // Thêm props nhận số chương tiếp theo
  onClose,
  onSave,
}: {
  storyId: string;
  storyName: string;
  initialChapterNumber: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number>(initialChapterNumber); // Gán giá trị mặc định
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map((file) =>
          ImgService.uploadChapterImage(file, storyName, Number(chapterNumber))
        )
      );
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!title || !chapterNumber) {
      alert("Vui lòng nhập số chương và tiêu đề.");
      return;
    }
    setLoading(true);
    try {
      await ChapterService.createChapter(storyId, {
        title,
        chapterNumber: Number(chapterNumber),
        imageUrls,
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm chương:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-[700px] h-[600px] flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Thêm chương mới</h2>

        {/* Bố cục chia thành 2 phần */}
        <div className="flex flex-row gap-4 h-full">
          {/* Cột nhập thông tin */}
          <div className="w-1/2 flex flex-col space-y-3">
            <label className="text-sm font-medium">Số chương:</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Nhập số chương"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(Number(e.target.value))}
              disabled // Không cho phép chỉnh sửa
            />

            <label className="text-sm font-medium">Tiêu đề chương:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Nhập tiêu đề chương"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="text-sm font-medium">Ảnh chương:</label>
            <input
              type="file"
              multiple
              className="w-full px-3 py-2 border rounded-md"
              onChange={handleImageUpload}
              title="Chọn ảnh chương"
              placeholder="Chọn ảnh chương"
            />
          </div>

          {/* Cột hiển thị ảnh */}
          <div className="w-1/2 flex justify-center items-center border rounded-md overflow-hidden">
            {imageUrls.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="w-full h-[300px]"
              >
                {imageUrls.map((url, index) => (
                  <SwiperSlide key={index} className="flex justify-center items-center">
                    <img
                      src={url}
                      alt={`Chapter Image ${index}`}
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p className="text-gray-500">Chưa có ảnh</p>
            )}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end space-x-2 mt-4">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-md" onClick={onClose}>
            Hủy
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
