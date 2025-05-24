import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const URL = process.env.DOCTOR_SERVICE_URL;

class DoctorApiService {
  async getDoctorById(doctorId) {
    try {
      const responseDoctor = await axios.get(
        `${URL}/api/doctors/${doctorId}`
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
  async getAllDoctor() {
    try {
      const responseDoctor = await axios.get(
        `${URL}/api/doctors`
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
  async getAllClinic() {
    try {
      const responseDoctor = await axios.get(
        `http://localhost:8002/api/doctors/clinics`
      );
      const clinicData = responseDoctor.data.DT;

      return {
        clinicData,
      
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
