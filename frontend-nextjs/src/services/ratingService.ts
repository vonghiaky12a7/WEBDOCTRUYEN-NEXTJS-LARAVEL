/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/api/stories";

export const RatingService = {
  // Thêm hoặc cập nhật rating
  async addRating(
    userId: string,
    storyId: string,
    rating: number
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/rating`, {
        userId,
        storyId,
        rating,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding rating:", error);
      throw new Error("Không thể thêm đánh giá.");
    }
  },

  // Lấy thông tin ratings của một truyện
  async getRatingsByStoryId(storyId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/${storyId}/ratings`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ratings for story ${storyId}:`, error);
      return { average: 0, count: 0, ratings: [] };
    }
  },

  // Các phương thức này có thể bỏ vì đã được xử lý trong StoryController
  // async getRatingsByStoryIds(storyIds: string[]): Promise<Record<string, any>> {
  //   try {
  //     // Tạo một object để lưu kết quả
  //     const result: Record<string, any> = {};

  //     // Lấy rating cho từng story
  //     await Promise.all(
  //       storyIds.map(async (storyId) => {
  //         try {
  //           const response = await this.getRatingsByStoryId(storyId);
  //           result[storyId] = {
  //             rating: response.average || 0,
  //             ratingCount: response.count || 0,
  //           };
  //         } catch (error) {
  //           console.error(`Error fetching rating for story ${storyId}:`, error);
  //           result[storyId] = { rating: 0, ratingCount: 0 };
  //         }
  //       })
  //     );

  //     return result;
  //   } catch (error) {
  //     console.error("Error fetching ratings for stories:", error);
  //     return {};
  //   }
  // },

  async getRatingsByStoryIds(storyIds: string[]) {
    try {
      const response = await axiosInstance.get("/api/ratings", {
        params: { storyIds: storyIds.join(",") }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return {};
    }
  },

  async rateStory(storyId: string, rating: number) {
    try {
      const response = await axiosInstance.post("/api/ratings", {
        storyId,
        rating
      });
      return response.data;
    } catch (error) {
      console.error("Error rating story:", error);
      throw error;
    }
  }
};
