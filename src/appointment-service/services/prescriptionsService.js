import { where } from "sequelize/lib/sequelize";
import emailService from "../../email-service/emailService";
import db from "../models";
const createPrescription = async (data) => {
  console.log("Creating prescription with data:", data);
  const t = await db.sequelize.transaction();

  try {
    // 1. Tìm hoặc tạo đơn thuốc cho lịch hẹn này
    let prescription = await db.prescriptions.findOne({
      where: { appointment_id: data.appointment_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!prescription) {
      prescription = await db.prescriptions.create(
        { appointment_id: data.appointment_id },
        { transaction: t }
      );
    }

    // 2. Thêm từng loại thuốc vào chi tiết đơn thuốc
    for (const med of data.medications) {
      await db.prescription_details.create(
        {
          prescription_id: prescription.id,
          medication_name: med.name,
          unit: med.unit,
          quantity: med.quantity,
          instructions: med.instructions || "Không có",
          category: med.category,
          note: med.notes || "Không có",
        },
        { transaction: t }
      );
    }

    await t.commit();

    return {
      EM: "Tạo đơn thuốc thành công!",
      EC: 0,
      DT: "",
    };
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return {
      EM: `Lỗi: ${error.message}`,
      EC: -1,
      DT: "",
    };
  }
};


const getPrescriptionByAppointmentId = async (appointmentId) => {
  try {
    const prescription = await db.prescriptions.findOne({
      where: { appointment_id: appointmentId },
      include: [
        {
          model: db.prescription_details,
          as: "prescription_details",
          order: [['createdAt', 'DESC']],
        },
      ],
      order: [[{ model: db.prescription_details, as: 'prescription_details' }, 'createdAt', 'DESC']],
    });

    if (prescription) {
      return {
        EM: "Tìm thấy đơn thuốc!",
        EC: 0,
        DT: prescription,
      };
    }

    return {
      EM: "Không tìm thấy đơn thuốc!",
      EC: 1,
      DT: "",
    };
  } catch (error) {
    return {
      EM: `Lỗi: ${error.message}`,
      EC: -1,
      DT: "",
    };
  }
};

const updatePrescription = async (id, data) => {
  try {
    const prescription = await db.prescription_details.findOne({
      where: { id: id },
    });
    if (!prescription)
      return {
        EM: "Thuốc không tồn tại.",
        EC: -1,
        DT: [],
      };

    const updatedDiagnosis = await prescription.update({
          medication_name: data.name,
          unit: data.unit,
          quantity: data.quantity,
          instructions: data.instructions || "Không có",
          category: data.category,
          note: data.note || "Không có",
    });
    if (!updatedDiagnosis) {
      return {
        EM: "Cập nhật thuốc thất bại.",
        EC: -2,
        DT: [],
      };
    }
    return {
      EM: "Cập nhật thuốc thành công!",
      EC: 0,
      DT: [],
    };
  } catch (error) {
    return {
      EM: "Lỗi hệ thống: " + error.message,
      EC: -2,
      DT: [],
    };
  }
};

const deletePrescription = async (id) => {
  try {
    const prescription_details = await db.prescription_details.findOne({
      where: { id: id },
    });
    if (!prescription_details) {
      return {
        EM: "Thuốc không tồn tại.",
        EC: -1,
        DT: [],
      };
    }
    await prescription_details.destroy();

    return {
      EM: "Xóa thuốc thành công!",
      EC: 0,
      DT: [],
    };
  } catch (error) {
    return {
      EM: "Lỗi hệ thống: " + error.message,
      EC: -2,
      DT: [],
    };
  }
};

const sendPrescription = async (id, data) => {
  try {
    // Kiểm tra đơn thuốc có tồn tại không
    const checkExist = await db.prescriptions.findOne({
      where: { id: id },
    });

    if (!checkExist) {
      return {
        EM: "Đơn thuốc không tồn tại.",
        EC: 1,
        DT: null,
      };
    }

    const dataToSend = {
      patientName: data.patientInfo.full_name,
      prescriptionUrl: data.prescriptionUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      doctorName: data.doctorData?.userData?.full_name,
      phone_number : data?.doctorData?.userData?.phone_number ,
      clinicName: data.clinicData.name,
      schedule: data.scheduleData.schedule.date,
      time_start: data.scheduleData.schedule.time_start,
          time_end : data.scheduleData.schedule.time_end
    };

    const res = await emailService.sendEmailPrescription(
       data.patientInfo.email,
      dataToSend
    );

    if (res) {
      return {
        EM: "Gửi đơn thuốc thành công.",
        EC: 0,
        DT: null,
      };
    } else {
      return {
        EM: "Không thể gửi email đơn thuốc.",
        EC: 2,
        DT: null,
      };
    }
  } catch (error) {
    console.error("Lỗi khi gửi đơn thuốc:", error);
    return {
      EM: "Đã xảy ra lỗi trong quá trình gửi đơn thuốc.",
      EC: -1,
      DT: null,
    };
  }
};

module.exports = {
  createPrescription,
  getPrescriptionByAppointmentId,
  deletePrescription,
  updatePrescription,
  sendPrescription

};
