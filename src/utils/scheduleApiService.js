import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const URL = process.env.DOCTOR_SERVICE_URL;

class scheduleApiService {
  async getSchedule(doctorId, scheduleId) {
    try {
      const response = await axios.get(
        `${URL}/api/doctors/${doctorId}/schedules/${scheduleId}`
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
   async updateStatusSchedule(doctorId, scheduleId , updateData) {
    try {
      const response = await axios.put(
        `${URL}/api/doctors/${doctorId}/schedules/${scheduleId}` ,updateData
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

export default new scheduleApiService();
