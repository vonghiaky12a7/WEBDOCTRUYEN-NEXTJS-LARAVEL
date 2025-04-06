// services/commentService.ts
import axiosInstance from "../utils/axiosInstance";
import { Comment } from "../models/comment";

export const CommentService = {
  async getComments(storyId: string): Promise<Comment[]> {
    try {
      const response = await axiosInstance.get(`/comments/${storyId}`);
      return response.data.comments;
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      throw error;
    }
  },

  async addComment(
    userId: string,
    storyId: string,
    content: string
  ): Promise<Comment> {
    try {
      const response = await axiosInstance.post("/comments/add", {
        userId,
        storyId,
        content,
      });
      return response.data.comment;
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      throw error;
    }
  },
};
