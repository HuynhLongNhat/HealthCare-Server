import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


class DoctorApiService {
 

  async getDoctorById(doctorId) {
    try {
      const responseDoctor = await axios.get(
        `http://localhost:8002/api/doctors/${doctorId}`
      );
      const doctorData = responseDoctor.data.DT;

      return {
        doctorData,
      
      };
    } catch (error) {
      console.error("get doctor error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return {
        EM: `Error fetching user: ${
          error.response?.data?.message || error.message
        }`,
        EC: error.response?.status || -1,
        DT: null,
      };
    }
  }
}

export default new DoctorApiService();
