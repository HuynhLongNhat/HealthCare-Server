import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class scheduleApi {
  async getSchedule(doctorId, scheduleId) {
    try {
      const response = await axios.get(
        `http://localhost:8002/api/doctors/${doctorId}/schedules/${scheduleId}`
      );

      const scheduleData = response.data.DT;
      if (!scheduleData) {
        return {
          EM: "Không nhận được dữ liệu từ server",
          EC: -1,
          DT: null,
        };
      }
      return {
        scheduleData,
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

export default new scheduleApi();
