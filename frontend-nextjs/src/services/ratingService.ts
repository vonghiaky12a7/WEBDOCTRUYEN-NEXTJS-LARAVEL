/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axiosInstance";

// Không cần import axios nữa vì chúng ta sẽ dùng axiosInstance
// const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/api/stories";
// Vì axiosInstance đã có baseURL là "http://localhost:8000", ta chỉ cần dùng đường dẫn tương đối

export const RatingService = {
  // Thêm hoặc cập nhật rating
  async addRating(
    userId: string,
    storyId: string,
    rating: number
  ): Promise<any> {
    try {
      const response = await axiosInstance.post("/api/stories/rating", {
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
      const response = await axiosInstance.get(
        `/api/stories/${storyId}/ratings`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching ratings for story ${storyId}:`, error);
      return { average: 0, count: 0, ratings: [] };
    }
  },

  async getRatingsByStoryIds(storyIds: string[]) {
    try {
      const response = await axiosInstance.get("/api/ratings", {
        params: { storyIds: storyIds.join(",") },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return {};
    }
  },

};
