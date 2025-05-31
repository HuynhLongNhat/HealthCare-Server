import db from "../models";
import appointmentApiService from "../../utils/appointmentApiService";
const createDiagnosis = async (data) => {
  try {
    const checkExisting = await db.diagnosis.findOne({
      where: { appointment_id: data.appointment_id },
    });
    if (checkExisting) {
      return {
        EM: "Bạn đã chẩn đoán bệnh cho lịch hẹn này rồi!",
        EC: 1,
        DT: "",
      };
    }
    const diagnosis = await db.diagnosis.create(data);
    if (diagnosis) {
      return {
        EM: "Tạo mới chẩn đoán bệnh thành công!",
        EC: 0,
        DT: "",
      };
    }
    return;
  } catch (error) {
    return {
      EM: `Lỗi : ${error.message}`,
      EC: -1,
      DT: "",
    };
  }
};

const getDiagnosisByAppointmentId = async (appointmentId) => {
  try {
    const diagnosis = await db.diagnosis.findOne({
      where: { appointment_id: appointmentId },
    });
    const appointment = await appointmentApiService.getAppointmentDetail(
      appointmentId
    );

    if (diagnosis) {
      return {
        EM: "Tìm thấy chẩn đoán bệnh!",
        EC: 0,
        DT: {
          appointment,
          diagnosis,
        },
      };
    }
    return;
  } catch (error) {
    return {
      EM: `Lỗi : ${error.message}`,
      EC: -1,
      DT: "",
    };
  }
};


const updateDiagnosis = async (id, data) => {
  try {
    const diagnosis = await db.diagnosis.findOne({
      where: { id: id },
    });
    if (!diagnosis)
      return {
        EM: "Chẩn đoán bệnh không tồn tại.",
        EC: -1,
        DT: [],
      };

    const updatedDiagnosis = await diagnosis.update(data);
    if (!updatedDiagnosis) {
      return {
        EM: "Cập nhật chẩn đoán bệnh thất bại.",
        EC: -2,
        DT: [],
      };
    }
    return {
      EM: "Cập nhật chẩn đoán bệnh thành công!",
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

const deleteDiagnosis = async (id) => {
  try {
    const diagnosis = await db.diagnosis.findOne({
      where: { id: id },
    });
    if (!diagnosis) {
      return {
        EM: "Chẩn đoán bệnh không tồn tại.",
        EC: -1,
        DT: [],
      };
    }
    await diagnosis.destroy();

    return {
      EM: "Xóa chẩn đoán bệnh thành công!",
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


module.exports = {
  createDiagnosis,
  getDiagnosisByAppointmentId,
  updateDiagnosis,
  deleteDiagnosis,
};
