import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class UserApiService {
  async getUserById(userId) {
    try {
      const response = await axios.get(
        `http://localhost:8001/api/users/${userId}`
      );

      const userData = response.data.DT;
      if (!userData) {
        return {
          EM: "Không nhận được dữ liệu từ server",
          EC: -1,
          DT: null,
        };
      }
      return {
        userData,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: null,
      };
    }
  }
  async getAllUsers() {
    try {
      const response = await axios.get(
        `http://localhost:8001/api/users/${userId}`
      );

      const userData = response.data.DT;
      if (!userData) {
        return {
          EM: "Không nhận được dữ liệu từ server",
          EC: -1,
          DT: null,
        };
      }
      return {
        userData,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: null,
      };
    }
  }
}

export default new UserApiService();
