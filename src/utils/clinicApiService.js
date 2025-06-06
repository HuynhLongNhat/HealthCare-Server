import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const URL = process.env.DOCTOR_SERVICE_URL;


class clinicApiService {
  async getClinic(clinicId) {
    try {
      const response = await axios.get(
        `${URL}/api/doctors/clinics/${clinicId}`
      );
      const clinicData = response.data.DT;
      if (!clinicData) {
        return {
          EM: "Không nhận được dữ liệu từ server",
          EC: -1,
          DT: null,
        };
      }
      return {
        clinicData,
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

export default new clinicApiService();
