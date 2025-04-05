export interface Comment {
  commentId?: string;
  userId: string;
  storyId: string;
  content: string;
  created_at?: string;
}

export const CommentService = {
  // Lấy danh sách bình luận của một truyện
  async getComments(storyId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách bình luận");
      }

      const data = await response.json();
      return data.comments;
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      throw error;
    }
  },

  // Thêm bình luận mới
  async addComment(
    userId: string,
    storyId: string,
    content: string
  ): Promise<Comment> {
    try {
      const response = await fetch("/api/stories/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, storyId, content }),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm bình luận");
      }

      const data = await response.json();
      return data.comment;
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      throw error;
    }
  },
};
