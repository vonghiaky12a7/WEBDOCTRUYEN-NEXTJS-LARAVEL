// services/favoriteService.ts
import axiosInstance from "../utils/axiosInstance";

export const FavoriteService = {
  async checkFavorite(userId: string, storyId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post("/favorites/check", {
        userId,
        storyId,
      });

      return response.data.isFavorited;
    } catch (error) {
      console.error("Lỗi khi kiểm tra yêu thích:", error);
      throw error;
    }
  },

  async addFavorite(userId: string, storyId: string): Promise<void> {
    try {
      await axiosInstance.post("/favorites/add", {
        userId,
        storyId,
      });
    } catch (error) {
      console.error("Lỗi khi thêm yêu thích:", error);
      throw error;
    }
  },

  async removeFavorite(userId: string, storyId: string): Promise<void> {
    try {
      await axiosInstance.delete("/favorites/remove", {
        data: { userId, storyId }, // DELETE request gửi body qua "data"
      });
    } catch (error) {
      console.error("Lỗi khi xóa yêu thích:", error);
      throw error;
    }
  },
};
