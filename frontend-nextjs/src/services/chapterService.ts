/* eslint-disable @typescript-eslint/no-explicit-any */
// services/chapterService.ts
import axiosInstance from "@/utils/axiosInstance";

const API_URL = "/api/stories";

export const ChapterService = {
  async getChaptersByStory(storyId: string) {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/${storyId}/chapters`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chapters:", error);
      throw error;
    }
  },

  async getChapter(storyId: string, chapterId: string) {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/${storyId}/chapter/${chapterId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      throw error;
    }
  },

  async createChapter(storyId: string, chapterData: any) {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/${storyId}/chapters`,
        chapterData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating chapter:", error);
      throw error;
    }
  },

  async updateChapter(storyId: string, chapterId: string, chapterData: any) {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/${storyId}/chapter/${chapterId}`,
        chapterData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating chapter:", error);
      throw error;
    }
  },

  async deleteChapter(storyId: string, chapterId: string) {
    try {
      const response = await axiosInstance.delete(
        `${API_URL}/${storyId}/chapter/${chapterId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting chapter:", error);
      throw error;
    }
  },
};
