import appointmentService from "../services/appointmentService";
import paymentApiService from "../services/paymentApiService";
import { verifyPayOSWebhook } from "../utils/payosWebhook";


const createAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(
     req.body
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
    const { userId } = req.params
    const appointments = await appointmentService.getAllAppointments(userId);
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
    const {id} = req.params;
    const appointment = await appointmentService.getAppointmentDetail(
      id
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
    const result = await appointmentService.cancelAppointment(
      id,
      req.body
    );
    return res.json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (error) {
    return res.json({
      EM: error.message,
      EC: -1,
      DT: null,
    });
  }
};

const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await appointmentService.approveAppointment(id);
    return res.json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (error) {
   return res.json({
      EM: error.message,
      EC: -1,
      DT: null,
    });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await appointmentService.rejectAppointment(
      id,
       req.body
    );

    return res.json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (error) {
    return res.json({
      EM: error.message,
      EC: -1,
      DT: null,
    });
  }
};


const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await appointmentService.confirmPayment(
      id
     
    );

    return res.json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (error) {
    return res.json({
      EM: error.message,
      EC: -1,
      DT: null,
    });
  }
};


 const generatePaymentLink = async (req, res) => {
   try {
  
    const { amount, description, orderCode, returnUrl, cancelUrl ,data} = req.body;
    if (!amount || !description || !orderCode || !returnUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const paymentUrl = await appointmentService.createPaymentLink({
      amount,
      description: description.slice(0, 25),
      orderCode,
      returnUrl,
      cancelUrl,
      data
    });

    return res.status(200).json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error("Payment link generation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment link",
    });
  }
};



export default {
  createAppointment,
  getAllAppointments,
  getAppointmentDetail,
  cancelAppointment,
  approveAppointment,
  rejectAppointment,
  generatePaymentLink,
  confirmPayment
};
