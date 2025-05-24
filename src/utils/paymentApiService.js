import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const URL = process.env.APPOINTMENT_SERVICE_URL;

class paymentApiService {
  async createNewPayment(data) {
    try {
      const response = await axios.post(
       `${URL}/api/payments` , data
      );
      if (response.data.EC === 0 ) {
        return {
          EM: "Tạo mới thanh toán thành công",
          EC: 0,
          DT: null,
        };
      }
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

export default new paymentApiService();
