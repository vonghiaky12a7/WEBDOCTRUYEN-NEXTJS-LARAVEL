/* eslint-disable @typescript-eslint/no-explicit-any */
// services/storyService.ts
import axiosInstance from "@/utils/axiosInstance";
import { Story } from "@/models/story";
import { Genre } from "@/models/genre";
import axios from "axios";

const STORY_API_URL = "/api/stories";
const GENRE_API_URL = "/api/genres";

export const StoryService = {
  async fetchStories(): Promise<Story[]> {
    try {
      const response = await axiosInstance.get(STORY_API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching stories:", error);
      throw new Error("Không thể tải danh sách truyện.");
    }
  },

  async fetchStoryById(id: string): Promise<Story> {
    try {
      const response = await axiosInstance.get(`${STORY_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching story ${id}:`, error);
      throw new Error(`Không thể tải truyện với ID ${id}`);
    }
  },

  async fetchStoriesDesc(
    options: { limit?: number; sort?: string } = {}
  ): Promise<Story[]> {
    const { limit = 5, sort = "newest" } = options;

    try {
      const response = await axiosInstance.get(`${STORY_API_URL}/list`, {
        params: {

          limit,
          sortBy:
            sort === "newest"
              ? "newest"
              : sort === "rating"
              ? "rating"
              : "oldest",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Lỗi khi tải danh sách truyện:", error);
      return [];
    }
  },

  async searchStories({
    title,
    genres,
    sortBy,
  }: {
    title?: string;
    genres?: number[];
    sortBy?: string;
  }): Promise<Story[]> {
    try {
      const queryParams = new URLSearchParams();
      if (title) queryParams.append("title", title);
      if (genres?.length) queryParams.append("genres", genres.join(","));
      if (sortBy) queryParams.append("sortBy", sortBy);

      const response = await axiosInstance.get(
        `${STORY_API_URL}/list?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching stories:", error);
      return [];
    }
  },

  async fetchGenres(): Promise<Genre[]> {
    try {
      const response = await axiosInstance.get(`${GENRE_API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  },

  async getChapterDetail(storyId: string, chapterId: string) {
    try {
      const response = await axiosInstance.get(
        `${STORY_API_URL}/${storyId}/chapter/${chapterId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Không tìm thấy chapter."
        );
      }
      throw new Error("Có lỗi không xác định.");
    }
  },

  async getAllRatingsDESC(limit: number): Promise<Story[]> {
    try {
      const response = await axiosInstance.get(
        `${STORY_API_URL}/top?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách truyện:", error);
      throw new Error("Không thể lấy danh sách truyện theo rating.");
    }
  },

  async createStory(storyData: any) {
    try {
      const response = await axiosInstance.post(STORY_API_URL, storyData);
      return response.data;
    } catch (error) {
      console.error("Error creating story:", error);
      throw error;
    }
  },

  async updateStory(storyId: string, storyData: any) {
    try {
      const response = await axiosInstance.put(
        `${STORY_API_URL}/${storyId}`,
        storyData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating story:", error);
      throw error;
    }
  },

  async deleteStory(storyId: string) {
    try {
      const response = await axiosInstance.delete(
        `${STORY_API_URL}/${storyId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting story:", error);
      throw error;
    }
  },
};
