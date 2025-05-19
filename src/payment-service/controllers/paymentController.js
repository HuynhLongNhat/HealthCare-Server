import paymentService from "../services/paymentService"

export const createNewPayment = async (req, res) => {
    try {
     const result = await paymentService.createNewPayment(req.body);
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

export const createNewPaymentForCash = async (req, res) => {
    try {
     const result = await paymentService.createNewPaymentForCash(req.body);
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

export const updateStatusPayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
     const result = await paymentService.updateStatusPayment(orderId,req.body);
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


export const getAllPayment = async (req, res) => {
  try {
    const {userId} = req.params
    const result = await paymentService.getAllPayment(userId);
      return res.json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
   
  } catch(error) {
    return res.json({
        EM: error.message,
        EC: -1,
        DT: null,
      });
  }
};


export const getPaymentDetail = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await paymentService.getPaymentDetail(paymentId);
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


export const getPaymentByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const result = await paymentService.getPaymentByAppointmentId(appointmentId);
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

export default {
   createNewPayment,
  getAllPayment,
  getPaymentDetail,
  updateStatusPayment,
  getPaymentByAppointmentId,
  createNewPaymentForCash
};