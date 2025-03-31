// services/genreService.ts
import { Genre } from "@/models/genre";
import axiosInstance from "@/utils/axiosInstance";

export class GenreService {
  static async getGenres(): Promise<Genre[]> {
    try {
      const response = await axiosInstance.get("/api/genres");
      return response.data;
    } catch (error) {
      console.error("Error fetching genres:", error);
      throw error;
    }
  }

  static async getGenre(id: number): Promise<Genre> {
    try {
      const response = await axiosInstance.get(`/api/genres/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching genre:", error);
      throw error;
    }
  }

  static async createGenre(genreData: { genreName: string }): Promise<Genre> {
    try {
      const response = await axiosInstance.post("/api/genres", genreData);
      return response.data;
    } catch (error) {
      console.error("Error creating genre:", error);
      throw error;
    }
  }

  static async updateGenre(
    id: number,
    genreData: { genreName: string }
  ): Promise<Genre> {
    try {
      const response = await axiosInstance.put(`/api/genres/${id}`, genreData);
      return response.data;
    } catch (error) {
      console.error("Error updating genre:", error);
      throw error;
    }
  }

  static async deleteGenre(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/genres/${id}`);
    } catch (error) {
      console.error("Error deleting genre:", error);
      throw error;
    }
  }
}
