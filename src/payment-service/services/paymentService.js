import userApiService from "../../appointment-service/services/userApiService";
import emailService from "../../email-service/emailService";
import db from "../models/";
import appointmentApiService from "./appointmentApiService";


export const createNewPayment = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const payment = await db.payments.create(
      {
        patient_id: data.data.appointment.patient_id,
        amount: data.amount,
        transfer_content: data.description,
        payment_date: new Date(),
        appointment_id: data.data.appointment.id,
        payos_order_id: data.orderCode || null,
        status_id: 1,
      },
      { transaction }
    );
    await transaction.commit();

    if (payment) {
      return {
        EM: "Thanh toán thành công",
        EC: 0,
        DT: null,
      };
    }
  } catch (error) {
    await transaction.rollback();

    return {
      EM: `Lỗi :${error.message}`,
      EC: -1,
      DT: null,
    };
  }
};

export const createNewPaymentForCash = async (data) => {
  try {
    const payment = await db.payments.create(
      {
        patient_id: data.patient_id,
        amount: data.amount,
        transfer_content: data.transfer_content,
        payment_date: new Date(),
        appointment_id: data.appointment_id,
        status_id: 2,
      },
    );
    const patientResponse = await userApiService.getUserById(
          data.patient_id
    );
   const payloadSendEmail = {
  patientName: patientResponse.userData.full_name,
  transfer_content: data.transfer_content,
  payment_date: new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
  amount: new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(data.amount),
};

    try {
      await emailService.sendEmailPaymentSuccess(
      // patientResponse.userData.email 
        "nhathuynh227@gmail.com"
        ,payloadSendEmail 
        )
    } catch (error) {
            console.error("Error sending rejection email:", error);

    }
    if (payment) {
      return {
        EM: "Xác nhận thanh toán thành công",
        EC: 0,
        DT: null,
      };
    }
  } catch (error) {
    return {
      EM: `Lỗi :${error.message}`,
      EC: -1,
      DT: null,
    };
  }
};

export const updateStatusPayment = async (orderCode, statusId) => {
  try {
    const payment = await db.payments.findOne({
      where: { payos_order_id: orderCode },
    });

    if (!payment) {
      throw new Error("Không tìm thấy thanh toán");
    }
    await payment.update(
      {
        status_id: statusId.statusId,
        payment_date:  new Date()
      },
    );
    return {
      EM: "Cập nhật trạng thái thanh toán thành công",
      EC: 0,
      DT: payment,
    };
  } catch (error) {
    return {
      EM: "Lỗi :",
      error,
      EC: -1,
      DT: [],
    };
  }
};

// Lấy tất cả payment (admin)
export const getAllPayment = async ({ userId }) => {
  try {
    // Lấy thông tin người dùng để xác định vai trò
    const { userData } = await userApiService.getUserById(userId);

    const whereCondition = {};
    if (userData.role_id === 3) {
      whereCondition.patient_id = userId;
    } else if (userData.role_id === 2) {
      whereCondition.doctor_id = userId;
    }
    const payments = await db.payments.findAll({
      where: whereCondition,
      include: [
        {
          model: db.payment_status,
          as: "status",
        },
      ],
      raw: true,
      nest: true,
      order: [["createdAt", "DESC"]],
    });

    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        try {
          const [appointmentInfo] = await Promise.all([
            appointmentApiService.getAppointmentDetail(payment.appointment_id),
          ]);

          const appointmentData = appointmentInfo.appointmentData;
          return {
            paymentData: payment,
            appointmentData,
          };
        } catch (error) {
          console.error(
            `Lỗi lấy chi tiết lịch hẹn ${appointment.appointment_id}:`,
            error
          );
          return null;
        }
      })
    );

    const validAppointments = paymentsWithDetails.filter(Boolean);

    return {
      EM: "Lấy danh sách thanh toán thành công",
      EC: 0,
      DT: validAppointments,
    };
  } catch (error) {
    console.error("Lỗi server:", error);
    return {
      EM: `Lỗi server: ${error.message}`,
      EC: -1,
      DT: [],
    };
  }
};

// Lấy chi tiết payment

export const getPaymentDetail = async (paymentId) => {
  try {
    // Lấy thông tin thanh toán
    const payment = await db.payments.findByPk(paymentId, {
      include: [{ model: db.payment_status, as: "status" }],
      raw: true,
      nest: true,
    });

    if (!payment) {
      return {
        EM: "Không tìm thấy thông tin thanh toán",
        EC: 1,
        DT: null,
      };
    }

    // Lấy thông tin lịch hẹn liên quan
    try {
      const appointmentInfo = await appointmentApiService.getAppointmentDetail(
        payment.appointment_id
      );
      const appointmentData = appointmentInfo.appointmentData;

      return {
        EM: "Lấy chi tiết thanh toán thành công",
        EC: 0,
        DT: {
          paymentData: payment,
          appointmentData,
        },
      };
    } catch (error) {
      console.error(
        `Lỗi lấy chi tiết lịch hẹn ${payment.appointment_id}:`,
        error
      );
      return {
        EM: "Không thể lấy thông tin lịch hẹn liên quan",
        EC: 2,
        DT: [],
      };
    }
  } catch (error) {
    console.error("Lỗi server:", error);
    return {
      EM: `Lỗi server: ${error.message}`,
      EC: -1,
      DT: null,
    };
  }
};

export const getPaymentByAppointmentId = async (appointmentId) => {
  try {
    // Lấy thông tin thanh toán
    const payment = await db.payments.findOne({
      where : {appointment_id : appointmentId},
      include: [{ model: db.payment_status, as: "status" }],
      raw: true,
      nest: true,
    });

    if (!payment) {
      return {
        EM: "Không tìm thấy thông tin thanh toán",
        EC: 1,
        DT: null,
      };
    }

    // Lấy thông tin lịch hẹn liên quan
    try {
      const appointmentInfo = await appointmentApiService.getAppointmentDetail(
        payment.appointment_id
      );
      const appointmentData = appointmentInfo.appointmentData;

      return {
        EM: "Lấy chi tiết thanh toán thành công",
        EC: 0,
        DT: {
          paymentData: payment,
          appointmentData,
        },
      };
    } catch (error) {
      console.error(
        `Lỗi lấy chi tiết lịch hẹn ${payment.appointment_id}:`,
        error
      );
      return {
        EM: "Không thể lấy thông tin lịch hẹn liên quan",
        EC: 2,
        DT: [],
      };
    }
  } catch (error) {
    console.error("Lỗi server:", error);
    return {
      EM: `Lỗi server: ${error.message}`,
      EC: -1,
      DT: null,
    };
  }
};


export default {
  createNewPayment,
  updateStatusPayment,
  getAllPayment,
  getPaymentDetail,
  getPaymentByAppointmentId,
  createNewPaymentForCash
};
