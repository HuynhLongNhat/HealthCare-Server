import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class appointmentApiService {
  async getAppointmentDetail(appointmentId) {
    try {
      const response = await axios.get(
        `http://localhost:8003/api/appointments/${appointmentId}`
      );

      const appointmentData = response.data.DT;
      if (!appointmentData) {
        return {
          EM: "Không nhận được dữ liệu từ server",
          EC: -1,
          DT: null,
        };
      }
      return {
        appointmentData,
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

export default new appointmentApiService();
