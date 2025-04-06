/* eslint-disable @typescript-eslint/no-unused-vars */
// services/imgService.ts
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";

const IMAGE_API_URL = ""; // Base URL đã được config trong axiosInstance

export const ImgService = {
  // Upload ảnh đại diện (avatar) của user
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file); // Sử dụng "image" thay vì "file" để khớp với API

    try {
      const response = await axiosInstance.post(
        `${IMAGE_API_URL}/upload/single`, // Sử dụng endpoint single upload
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Ảnh avatar đã tải lên:", response.data.url);
      return response.data.url;
    } catch (error) {
      console.error(
        "❌ Lỗi khi tải ảnh avatar lên:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw new Error("Không thể tải ảnh avatar lên.");
    }
  },

  // Upload ảnh bìa truyện
  async uploadStoryBackground(file: File, storyName: string): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axiosInstance.post(
        `${IMAGE_API_URL}/upload/single`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Ảnh bìa truyện đã tải lên:", response.data.url);
      return response.data.url;
    } catch (error) {
      console.error(
        "❌ Lỗi khi tải ảnh bìa truyện lên:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw new Error("Không thể tải ảnh bìa truyện lên.");
    }
  },

  // Upload nhiều ảnh chapter
  async uploadChapterImages(
    files: File[],
    storyName: string,
    chapterNumber: number
  ): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      const customFileName = `${storyName}_Chapter_${chapterNumber}_${file.name}`;
      formData.append("images[]", file, customFileName); // Thêm tên file tuỳ chỉnh
    });

    try {
      const response = await axiosInstance.post(
        `${IMAGE_API_URL}/upload/multiple`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Ảnh chapter đã tải lên:", response.data.images);
      return response.data.images.map((img: { url: string }) => img.url);
    } catch (error) {
      console.error(
        "❌ Lỗi khi tải ảnh chapter lên:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw new Error("Không thể tải ảnh chapter lên.");
    }
  },
};
