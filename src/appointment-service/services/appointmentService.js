import db from "../models";
import doctorApiService from "./doctorApiService";
import userApiService from "./userApiService";
import { v4 as uuidv4 } from "uuid";
import emailService from "../../email-service/emailService";
const createAppointment = async (
  patient_id,
  doctor_id,
  appointment_date,
  note,
  start_time,
  end_time
) => {
  const doctorResponse = await doctorApiService.getDoctorById(doctor_id);
  if (!doctorResponse) {
    return {
      EM: "Không tìm thấy bác sĩ",
      EC: -2,
      DT: "",
    };
  }
  if (new Date(appointment_date + " " + start_time) < new Date()) {
    return {
      EM: "Ngày đặt lịch phải lớn hơn ngày hiện tại",
      EC: -3,
      DT: "",
    };
  }
  const newAppointment = await db.appointments.create({
    appointment_id: uuidv4(),
    patient_id: patient_id,
    doctor_id: doctor_id,
    appointment_date: appointment_date,
    note: note,
    start_time: start_time,
    end_time: end_time,
    booking_time: new Date(),
    status_id: 1,
  });
   const patientResponse = await userApiService.getUserById(patient_id);
  if (newAppointment) {
    try {
      await emailService.sendAppointmentConfirmationEmail(
       patientResponse.userData.email,
        await getAppointmentDetail(newAppointment.appointment_id)
      );
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }

    return {
      EM: "Đặt lịch thành công!",
      EC: 0,
      DT: newAppointment,
    };
  } else {
    return {
      EM: "Đặt lịch thất bại!",
      EC: -1,
      DT: "",
    };
  }
};

const getAllAppointments = async (role, userId) => {
  try {
    let whereCondition = {};
    if (role === "PATIENT") {
      whereCondition.patient_id = userId;
    } else if (role === "DOCTOR") {
      whereCondition.doctor_id = userId;
    }

    const appointments = await db.appointments.findAll({
      where: whereCondition,
      attributes: { exclude: ["status_id"] },
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

    // Lấy thông tin chi tiết cho từng lịch hẹn
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const [doctorInfo, patientInfo] = await Promise.all([
            doctorApiService.getDoctorById(appointment.doctor_id),
            userApiService.getUserById(appointment.patient_id),
          ]);

          console.log("doctorInfo", doctorInfo);
          console.log("patientInfo", patientInfo);

          if (!doctorInfo || !patientInfo) {
            console.error(
              `Missing data for appointment ${appointment.appointment_id}`
            );
            return null;
          }

          // Xử lý user_profiles từ patientInfo
          const patientProfile =
            Array.isArray(patientInfo.userData.user_profiles) &&
            patientInfo.userData.user_profiles.length > 0
              ? patientInfo.userData.user_profiles[0]
              : {};

          return {
            appointment_id: appointment.appointment_id || "",
            appointment_date: appointment.appointment_date || "",
            start_time: appointment.start_time || "",
            end_time: appointment.end_time || "",
            booking_time: appointment.booking_time || "",
            cancellation_time: appointment.cancellation_time || "",
            cancellation_reason: appointment.cancellation_reason || "",
            rejection_time: appointment.rejection_time || "",
            rejection_reason: appointment.rejection_reason || "",
            status: appointment.status.status_name,
            doctorInfor: {
              doctor_id: doctorInfo.doctorData.doctor_id || "",
              specialization: {
                name: doctorInfo.doctorData.specialization.name || "",
                description:
                  doctorInfo.doctorData.specialization.description || "",
              },
              position: doctorInfo.doctorData.position || "",
              experience_years: doctorInfo.doctorData.experience_years || "",
              consultation_fee: doctorInfo.doctorData.consultation_fee || "",
              full_name: doctorInfo.doctorData.full_name || "",
              email: doctorInfo.doctorData.email || "",
              phone: doctorInfo.doctorData.phone || "",
              user_role: doctorInfo.doctorData.user_role || "",
              date_of_birth: doctorInfo.doctorData.date_of_birth || "",
              gender: doctorInfo.doctorData.gender || "",
              address: doctorInfo.doctorData.address || "",
              avatar: doctorInfo.doctorData.avatar || "",
            },
            patientInfor: {
              patient_id: patientInfo.userData.user_id || "",
              email: patientInfo.userData.email || "",
              user_role: patientInfo.userData.user_role || "",
              full_name: patientProfile.full_name || "",
              date_of_birth: patientProfile.date_of_birth || "",
              gender: patientProfile.gender || "",
              address: patientProfile.address || "",
              avatar: patientProfile.avatar || "",
            },
          };
        } catch (error) {
          console.error(
            `Error fetching details for appointment ${appointment.appointment_id}:`,
            error
          );
          return null;
        }
      })
    );

    // Lọc ra các lịch hẹn hợp lệ
    const validAppointments = appointmentsWithDetails.filter(
      (appointment) => appointment !== null
    );

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

const getAppointmentDetail = async (appointmentId, userRole, userId) => {
  try {
    // Tìm lịch hẹn trong database
    const appointment = await db.appointments.findOne({
      where: { appointment_id: appointmentId },
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

    // Kiểm tra quyền truy cập
    if (
      (userRole === "DOCTOR" && appointment.doctor_id !== userId) ||
      (userRole === "PATIENT" && appointment.patient_id !== userId)
    ) {
      return {
        EM: "Không có quyền xem chi tiết lịch hẹn này",
        EC: -2,
        DT: null,
      };
    }

    // Lấy thông tin bác sĩ và bệnh nhân từ các API liên quan
    const [doctorInfo, patientInfo] = await Promise.all([
      doctorApiService.getDoctorById(appointment.doctor_id),
      userApiService.getUserById(appointment.patient_id),
    ]);

    // Kiểm tra dữ liệu từ các API
    if (!doctorInfo || !patientInfo) {
      return {
        EM: "Không thể lấy đầy đủ thông tin chi tiết",
        EC: -3,
        DT: null,
      };
    }

    // Xử lý dữ liệu thông tin bệnh nhân
    const patientProfile =
      Array.isArray(patientInfo.userData.user_profiles) &&
      patientInfo.userData.user_profiles.length > 0
        ? patientInfo.userData.user_profiles[0]
        : {};

    // Tạo object chứa chi tiết lịch hẹn
    const appointmentDetail = {
      appointment_id: appointment.appointment_id || "",
      appointment_date: appointment.appointment_date || "",
      start_time: appointment.start_time || "",
      end_time: appointment.end_time || "",
      booking_time: appointment.booking_time || "",
      note: appointment.note || "",
      cancellation_time: appointment.cancellation_time || "",
      cancellation_reason: appointment.cancellation_reason || "",
      rejection_time: appointment.rejection_time || "",
      rejection_reason: appointment.rejection_reason || "",
      status: appointment.status.status_name || "",
      doctorInfor: {
        doctor_id: doctorInfo.doctorData.doctor_id || "",
        specialization: {
          name: doctorInfo.doctorData.specialization.name || "",
          description: doctorInfo.doctorData.specialization.description || "",
        },
        position: doctorInfo.doctorData.position || "",
        experience_years: doctorInfo.doctorData.experience_years || "",
        consultation_fee: doctorInfo.doctorData.consultation_fee || "",
        full_name: doctorInfo.doctorData.full_name || "",
        email: doctorInfo.doctorData.email || "",
        phone: doctorInfo.doctorData.phone || "",
        user_role: doctorInfo.doctorData.user_role || "",
        date_of_birth: doctorInfo.doctorData.date_of_birth || "",
        gender: doctorInfo.doctorData.gender || "",
        address: doctorInfo.doctorData.address || "",
        avatar: doctorInfo.doctorData.avatar || "",
      },
      patientInfor: {
        patient_id: patientInfo.userData.user_id || "",
        email: patientInfo.userData.email || "",
        user_role: patientInfo.userData.user_role || "",
        full_name: patientProfile.full_name || "",
        date_of_birth: patientProfile.date_of_birth || "",
        gender: patientProfile.gender || "",
        address: patientProfile.address || "",
        avatar: patientProfile.avatar || "",
      },
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

const cancelAppointment = async (appointmentId, userId, cancelReason) => {
  try {
    const appointment = await db.appointments.findOne({
      where: { appointment_id: appointmentId, patient_id: userId },
    });

    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }

    appointment.cancellation_time = new Date();
    appointment.cancellation_reason = cancelReason;
    appointment.status_id = 3;

   const patientResponse = await userApiService.getUserById(userId);
    await appointment.save();
    try {
      await emailService.sendAppointmentCancellationEmail(
        patientResponse.userData.email,
        await getAppointmentDetail(appointmentId)
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
      EM: "Lỗi server",
      EC: -1,
      DT: null,
    };
  }
};

const approveAppointment = async (appointmentId, userId, userRole) => {
  try {
    const appointment = await db.appointments.findOne({
      where: { appointment_id: appointmentId },

    });
    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }

    // Kiểm tra quyền hạn của user
    if (userRole === "DOCTOR") {
      // Chuyển đổi cả hai về string nếu chúng khác kiểu dữ liệu
      const doctorId = String(appointment.doctor_id); // Chuyển doctor_id về string
      const userIdStr = String(userId); // Chuyển userId về string

      if (doctorId !== userIdStr) {
        return {
          EM: "Bạn không có quyền đồng ý lịch hẹn này",
          EC: -1,
          DT: null,
        };
      }
    }

    // Admin có quyền cập nhật tất cả lịch hẹn
    appointment.approval_time = new Date();
    appointment.status_id = 2; // Giả định 2 là trạng thái "Đã đồng ý"
    await appointment.save();
      const patientResponse = await userApiService.getUserById(appointment.patient_id);

      const doctortResponse = await userApiService.getUserById(userId);

      console.log("patientResponse" , patientResponse )
    try {
      await emailService.sendAppointmentApprovalEmail(
        patientResponse.userData.email,
        await getAppointmentDetail(appointmentId)
      );
       await emailService.sendAppointmentApprovalEmail(
         doctortResponse.userData.email,
         await getAppointmentDetail(appointmentId)
       );
    } catch (error) {
      console.error("Error sending approval email:", error);
    }
    return {
      EM: "Đồng ý lịch hẹn thành công",
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

const rejectAppointment = async (
  appointmentId,
  userId,
  rejectReason,
  userRole
) => {
  try {
    const appointment = await db.appointments.findOne({
      where: { appointment_id: appointmentId },
    });
     
    if (!appointment) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: null,
      };
    }

    // Kiểm tra quyền hạn của user
    if (userRole === "DOCTOR") {
      // Bác sĩ chỉ có quyền trên lịch hẹn của mình
      if (appointment.doctor_id !== userId) {
        return {
          EM: "Bạn không có quyền từ chối lịch hẹn này",
          EC: -1,
          DT: null,
        };
      }
    }

    // Admin có quyền cập nhật tất cả lịch hẹn
    appointment.rejection_time = new Date();
    appointment.rejection_reason = rejectReason;
    appointment.status_id = 4; // Giả định 4 là trạng thái "Đã từ chối"
    await appointment.save();
  
    const patientResponse = await userApiService.getUserById(
            appointment.patient_id
          );
    const doctorResponse = await userApiService.getUserById(userId);

    try {
      await emailService.sendAppointmentRejectionEmail(
        patientResponse.userData.email,
        await getAppointmentDetail(appointmentId)
      );

        await emailService.sendAppointmentRejectionEmail(
          doctorResponse.userData.email,
          await getAppointmentDetail(appointmentId)
        );
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
      EM: "Lỗi server",
      EC: -1,
      DT: null,
    };
  }
};

export default {
  createAppointment,
  getAllAppointments,
  getAppointmentDetail,
  cancelAppointment,
  approveAppointment,
  rejectAppointment,
};
