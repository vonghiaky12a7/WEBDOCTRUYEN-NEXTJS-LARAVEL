// services/userService.ts
import { User } from "@/models/user";
import axiosInstance from "@/utils/axiosInstance";

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get("/api/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async updateUserRole(userId: string, roleId: number): Promise<User> {
    try {
      const response = await axiosInstance.put(`/api/users/${userId}`, {
        roleId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/users/${userId}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};


