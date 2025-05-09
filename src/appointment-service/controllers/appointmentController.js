import appointmentService from "../services/appointmentService";


const createAppointment = async (req, res) => {
  try {
    const patient_id = req.user.userId;
    const { doctor_id, appointment_date, note, start_time, end_time } =
      req.body;

    const appointment = await appointmentService.createAppointment(
      patient_id,
      doctor_id,
      appointment_date,
      note,
      start_time,
      end_time
    );

    return res.json({
      EM: appointment.EM,
      EC: appointment.EC,
      DT: appointment.DT,
    });
  } catch (error) {
    return res.json({
      EM: error.message,
      EC: -1,
      DT: [],
    });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const user = req.user;
   const { role, userId } = user;
    const appointments = await appointmentService.getAllAppointments(role, userId);
    return res.json({
      EM: appointments.EM,
      EC: appointments.EC,
      DT: appointments.DT,
    });
  } catch (error) {
    return res.json({
      EM: error.message,
      EC: -1,
      DT: [],
    });
  }
};

const getAppointmentDetail = async (req, res) => {
  try {
    const appointmentId = req.params.id;
      const user = req.user;
      const { role, userId } = user;
    const appointment = await appointmentService.getAppointmentDetail(
      appointmentId,
      role,
      userId
    );

    return res.json({
      EM: appointment.EM,
      EC: appointment.EC,
      DT: appointment.DT,
    });
  } catch (error) {
    return res.json({
      EM: error.message,
      EC: -1,
      DT: null,
    });
  }
};
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancel_reason } = req.body;
    const userId = req.user.userId;

    const result = await appointmentService.cancelAppointment(
      id,
      userId,
      cancel_reason
    );

    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({ EM: "Lỗi server", EC: -1 });
  }
};

const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await appointmentService.approveAppointment(id, userId);

    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error approving appointment:", error);
    return res.status(500).json({ EM: "Lỗi server", EC: -1 });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reject_reason } = req.body;
    const userId = req.user.userId;

    const result = await appointmentService.rejectAppointment(
      id,
      userId,
      reject_reason
    );

    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    return res.status(500).json({ EM: "Lỗi server", EC: -1 });
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
