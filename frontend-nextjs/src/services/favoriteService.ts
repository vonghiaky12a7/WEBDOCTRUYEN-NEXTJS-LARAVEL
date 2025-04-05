import { Story } from "../models/story";

export const FavoriteService = {
  // Kiểm tra xem truyện có trong danh sách yêu thích của người dùng không
  async checkFavorite(userId: string, storyId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/stories/favorites/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Giả định bạn lưu token trong localStorage
        },
      });

      if (!response.ok) {
        throw new Error("Không thể kiểm tra trạng thái yêu thích");
      }

      const data = await response.json();
      return data.favorites.some((fav: Story) => fav.storyId === storyId);
    } catch (error) {
      console.error("Lỗi khi kiểm tra yêu thích:", error);
      throw error;
    }
  },

  // Thêm truyện vào danh sách yêu thích
  async addFavorite(userId: string, storyId: string): Promise<void> {
    try {
      const response = await fetch("/api/stories/favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, storyId }),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm truyện vào yêu thích");
      }
    } catch (error) {
      console.error("Lỗi khi thêm yêu thích:", error);
      throw error;
    }
  },

  // Xóa truyện khỏi danh sách yêu thích
  async removeFavorite(userId: string, storyId: string): Promise<void> {
    try {
      const response = await fetch("/api/stories/favorite", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, storyId }),
      });

      if (!response.ok) {
        throw new Error("Không thể xóa truyện khỏi yêu thích");
      }
    } catch (error) {
      console.error("Lỗi khi xóa yêu thích:", error);
      throw error;
    }
  },

  // Lấy danh sách truyện yêu thích của người dùng
  async getFavorites(userId: string): Promise<Story[]> {
    try {
      const response = await fetch(`/api/stories/favorites/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách yêu thích");
      }

      const data = await response.json();
      return data.favorites;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu thích:", error);
      throw error;
    }
  },
};
