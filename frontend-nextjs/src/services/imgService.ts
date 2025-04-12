/* eslint-disable @typescript-eslint/no-unused-vars */
// services/imgService.ts
import axiosInstance from "@/utils/axiosInstance";

const IMAGE_API_URL = "";

export const ImgService = {
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axiosInstance.post(
      `${IMAGE_API_URL}/upload/single`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.url;
  },

  uploadStoryBackground: async (
    file: File,
    storyName: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axiosInstance.post(
      `${IMAGE_API_URL}/upload/single`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.url;
  },

  uploadChapterImages: async (
    files: File[],
    storyName: string,
    chapterNumber: number
  ): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      const customFileName = `${storyName}_Chapter_${chapterNumber}_${file.name}`;
      formData.append("images[]", file, customFileName);
    });
    const response = await axiosInstance.post(
      `${IMAGE_API_URL}/upload/multiple`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.images.map((img: { url: string }) => img.url);
  },
};
