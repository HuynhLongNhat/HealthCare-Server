import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class paymentApiService {
  async createNewPayment(data) {
    try {
      const response = await axios.post(
       "http://localhost:8004/api/payments" , data
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
