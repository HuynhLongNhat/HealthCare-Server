import db from "../models";
import doctorApiService from "../../utils/doctorApiService";
import userApiService from "../../utils/userApiService";
import emailService from "../../email-service/emailService";
import clinicApiService from "../../utils/clinicApiService";
import scheduleApiService from "../../utils/scheduleApiService";
import paymentApiService from "../../utils/paymentApiService";
const PayOS = require("@payos/node");
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

const createAppointment = async (data) => {
  try {
    // Kiểm tra bác sĩ
    const doctorResponse = await doctorApiService.getDoctorById(data.doctor_id);
    if (!doctorResponse) {
      return {
        EM: "Không tìm thấy bác sĩ",
        EC: -1,
        DT: "",
      };
    }

    // Kiểm tra bệnh nhân
    const patientResponse = await userApiService.getUserById(data.patient_id);
    if (!patientResponse) {
      return {
        EM: "Không tìm thấy bệnh nhân",
        EC: -2,
        DT: "",
      };
    }

    const existingAppointment = await db.appointments.findOne({
      where: {
        patient_id: data.patient_id,
        schedule_id: data.schedule_id,
        status_id: [1, 2],
      },
    });

    if (existingAppointment) {
      return {
        EM: "Bạn đã đặt lịch khám này rồi. Vui lòng kiểm tra lại lịch hẹn của bạn.",
        EC: -4,
        DT: existingAppointment,
      };
    }

    // Tạo lịch hẹn mới
    const newAppointment = await db.appointments.create({
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      schedule_id: data.schedule_id,
      clinic_id: data.clinic_id,
      medical_examination_reason: data.medical_examination_reason,
      booking_time: data.booking_time,
      payment_method: data.payment_method,
      status_id: 1, 
    });

     await scheduleApiService.updateStatusSchedule(data.doctor_id, data.schedule_id, { status: "BOOKED" });


    if (newAppointment) {
      try {
        // Gửi email xác nhận cho bệnh nhân
        await emailService.sendAppointmentConfirmationEmail(
          patientResponse.userData.email,
          await getAppointmentDetail(newAppointment.id),
          false
        );

        // Gửi thông báo cho bác sĩ
        await emailService.sendAppointmentConfirmationEmail(
          doctorResponse.doctorData.userData.email,
          await getAppointmentDetail(newAppointment.id),
          true
        );
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        // Vẫn trả về thành công dù gửi email lỗi
      }

      return {
        EM: "Đặt lịch thành công!",
        EC: 0,
        DT: newAppointment,
      };
    } else {
      return {
        EM: "Đặt lịch thất bại!",
        EC: -3,
        DT: "",
      };
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      EM: "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.",
      EC: -5,
      DT: "",
    };
  }
};
const getAllAppointments = async (userId) => {
  try {
    // Lấy thông tin người dùng để xác định vai trò
    const { userData } = await userApiService.getUserById(userId);

    const whereCondition = {};
    if (userData.role_id === 3) {
      whereCondition.patient_id = userId;
    } else if (userData.role_id === 2) {
      whereCondition.doctor_id = userId;
    }
    const appointments = await db.appointments.findAll({
      where: whereCondition,
      include: [
        {
          model: db.appointment_status,
          as: "status",
          attributes: ["status_name"],
        },
      ],
      raw: true,
      nest: true,
      order: [["createdAt", "DESC"]]

    });

    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const [doctorInfo, patientInfo, clinicInfo, scheduleInfo] =
            await Promise.all([
              doctorApiService.getDoctorById(appointment.doctor_id),
              userApiService.getUserById(appointment.patient_id),
              clinicApiService.getClinic(appointment.clinic_id),
              scheduleApiService.getSchedule(
                appointment.doctor_id,
                appointment.schedule_id
              ),
            ]);

          const doctorData = doctorInfo.doctorData;
          const patientData = patientInfo.userData;
          const clinicData = clinicInfo.clinicData;
          const scheduleData = scheduleInfo.scheduleData;

          return {
            appointment,
            doctorData,
            patientData,
            clinicData,
            scheduleData,
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

    const validAppointments = appointmentsWithDetails.filter(Boolean);

    return {
      EM: "Lấy danh sách lịch hẹn thành công",
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

const getAppointmentDetail = async (id) => {
  try {
    // Tìm lịch hẹn trong database
    const appointment = await db.appointments.findOne({
      where: { id: id },
      include: [
        {
          model: db.appointment_status,
          as: "status",
          attributes: ["status_name"],
        },
      ],
      raw: true,
      nest: true,
    });

    // Kiểm tra xem lịch hẹn có tồn tại không
    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }

    // Lấy chi tiết bác sĩ, bệnh nhân, phòng khám, và lịch khám
    const [doctorInfo, patientInfo, clinicInfo, scheduleInfo] =
      await Promise.all([
        doctorApiService.getDoctorById(appointment.doctor_id),
        userApiService.getUserById(appointment.patient_id),
        clinicApiService.getClinic(appointment.clinic_id),
        scheduleApiService.getSchedule(appointment.doctor_id, appointment.schedule_id),
      ]);

    const doctorData = doctorInfo?.doctorData || null;
    const patientData = patientInfo?.userData || null;
    const clinicData = clinicInfo?.clinicData || null;
    const scheduleData = scheduleInfo?.scheduleData || null;

    const appointmentDetail = {
      appointment,
      doctorData,
      patientData,
      clinicData,
      scheduleData,
    };

    return {
      EM: "Lấy chi tiết lịch hẹn thành công",
      EC: 0,
      DT: appointmentDetail,
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết lịch hẹn:", error);
    return {
      EM: `Lỗi server: ${error.message}`,
      EC: -1,
      DT: null,
    };
  }
};

const cancelAppointment = async (id, data) => {
  try {
    const appointment = await db.appointments.findOne({
      where: { id: id },
    });

    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }

    appointment.cancellation_time = new Date();
    appointment.cancellation_reason = data.cancellation_reason;
    appointment.status_id = 3;

    const doctorResponse = await doctorApiService.getDoctorById(
      appointment.doctor_id
    );
    if (!doctorResponse) {
      return {
        EM: "Không tìm thấy bác sĩ",
        EC: -2,
        DT: "",
      };
    }

    // Kiểm tra bệnh nhân
    const patientResponse = await userApiService.getUserById(
      appointment.patient_id
    );
    if (!patientResponse) {
      return {
        EM: "Không tìm thấy bệnh nhân",
        EC: -3,
        DT: "",
      };
    }

    await appointment.save();
    await scheduleApiService.updateStatusSchedule(appointment.doctor_id, appointment.schedule_id, { status: "AVAILABLE" });

    try {
      await emailService.sendAppointmentCancellationEmail(
        patientResponse.userData.email,
        await getAppointmentDetail(id),
        false
      );
      // Gửi thông báo cho bác sĩ
      await emailService.sendAppointmentCancellationEmail(
        doctorResponse.doctorData.userData.email,

        await getAppointmentDetail(id),
        true
      );
    } catch (error) {
      console.error("Error sending cancellation email:", error);
    }


    return {
      EM: "Hủy lịch hẹn thành công",
      EC: 0,
      DT: appointment,
    };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      EM: "Lỗi server:",
      error,
      EC: -4,
      DT: null,
    };
  }
};

const approveAppointment = async (appointmentId) => {
  try {
    const appointment = await db.appointments.findOne({
      where: { id: appointmentId },
    });
    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }

    appointment.approval_time = new Date();
    appointment.status_id = 2;
    await appointment.save();
    const doctorResponse = await doctorApiService.getDoctorById(
      appointment.doctor_id
    );
    const patientResponse = await userApiService.getUserById(
      appointment.patient_id
    );

    try {
      await emailService.sendAppointmentApprovalEmail(
        patientResponse.userData.email,
        await getAppointmentDetail(appointmentId),
        false
      );

      // await emailService.sendAppointmentApprovalEmail(
      //   doctorResponse.doctorData.userData.email,

      //   await getAppointmentDetail(appointmentId),
      //   true
      // );
    } catch (error) {
      console.error("Error sending approval email:", error);
    }
    return {
      EM: "Phê duyệt lịch hẹn thành công",
      EC: 0,
      DT: appointment,
    };
  } catch (error) {
    console.error("Error approving appointment:", error);
    return {
      EM: "Lỗi server",
      EC: -1,
      DT: null,
    };
  }
};

const rejectAppointment = async (appointmentId, data) => {
  try {
    const appointment = await db.appointments.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }

    // Admin có quyền cập nhật tất cả lịch hẹn
    appointment.rejection_time = new Date();
    appointment.rejection_reason = data.rejecton_reson;
    appointment.status_id = 4;
    await appointment.save();
    await scheduleApiService.updateStatusSchedule(appointment.doctor_id, appointment.schedule_id, { status: "AVAILABLE" });

    const patientResponse = await userApiService.getUserById(
      appointment.patient_id
    );
    const doctorResponse = await doctorApiService.getDoctorById(
      appointment.doctor_id
    );

    try {
      await emailService.sendAppointmentRejectionEmail(
        patientResponse.userData.email,
        await getAppointmentDetail(appointmentId),
        false
      );
      // await emailService.sendAppointmentRejectionEmail(
      //   doctorResponse.doctorData.userData.email,

      //   await getAppointmentDetail(appointmentId),
      //   true
      // );
    } catch (error) {
      console.error("Error sending rejection email:", error);
    }

    return {
      EM: "Từ chối lịch hẹn thành công",
      EC: 0,
      DT: appointment,
    };
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    return {
      EM: "Lỗi ", error,
      error,
      EC: -1,
      DT: null,
    };
  }
};


const confirmPayment = async (appointmentId) => {
  try {
    const appointment = await db.appointments.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }


    appointment.status_id = 5;
    await appointment.save();

    const patientResponse = await userApiService.getUserById(
      appointment.patient_id
    );
    const doctorResponse = await doctorApiService.getDoctorById(
      appointment.doctor_id
    );

    try {
      // await emailService.sendAppointmentRejectionEmail(
      //   patientResponse.userData.email,
      //   await getAppointmentDetail(appointmentId),
      //   false
      // );
      // await emailService.sendAppointmentRejectionEmail(
      //   doctorResponse.doctorData.userData.email,

      //   await getAppointmentDetail(appointmentId),
      //   true
      // );
    } catch (error) {
      console.error("Error sending rejection email:", error);
    }

    return {
      EM: "Lịch hẹn đã được thanh toán",
      EC: 0,
      DT: appointment,
    };
  } catch (error) {
    console.error("Error", error);
    return {
      EM: `Lỗi ${error.message}`,
      EC: -1,
      DT: null,
    };
  }
};

export const createPaymentLink = async (order) => {
  try {
    if (!payos) {
      throw new Error("PayOS client not initialized");
    }
    await paymentApiService.createNewPayment(order)
    const paymentLinkResponse = await payos.createPaymentLink({
      orderCode: order.orderCode,
      amount: parseInt(order.amount),
      description: order.description,
      returnUrl: order.returnUrl,
      cancelUrl: order.cancelUrl,
      expiredAt: Math.floor((Date.now() + 15 * 60 * 1000) / 1000) 
    });

    if (!paymentLinkResponse || !paymentLinkResponse.checkoutUrl) {
      throw new Error("Invalid payment link response from PayOS");
    }
    return paymentLinkResponse;
  } catch (error) {
    console.error("Error in createPaymentLink:", error);
    throw new Error(`Payment link creation failed: ${error.message}`);
  }
};

export default {
  createAppointment,
  getAllAppointments,
  getAppointmentDetail,
  cancelAppointment,
  approveAppointment,
  rejectAppointment,
  createPaymentLink,
  confirmPayment,
  
};
