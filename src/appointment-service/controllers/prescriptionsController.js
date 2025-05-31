import prescriptionsService from "../services/prescriptionsService";
const createPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionsService.createPrescription(req.body);
    return res.status(200).json({
      EM: prescription.EM,
      EC: prescription.EC,
      DT: prescription.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EM: error.message,
      EC: -1,
      DT: [],
    });
  }
};

const getPrescriptionByAppointmentId = async (req, res) => {
  try {
    const prescription = await prescriptionsService.getPrescriptionByAppointmentId(
      req.params.appointmentId
    );
   return res.status(200).json({
      EM: prescription.EM,
      EC: prescription.EC,
      DT: prescription.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EM: error.message,
      EC: -1,
      DT: [],
    });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const prescription = await prescriptionsService.updatePrescription(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      EM: prescription.EM,
      EC: prescription.EC,
      DT: prescription.DT,
    });
 
  } catch (error) {
     return res.status(500).json({
      EM: res.EM,
      EC: -1,
      DT: [],
    });
  }
};

const deletePrescription = async (req, res) => {
  try {
    const diagnosis = await prescriptionsService.deletePrescription(req.params.id);
    return res.status(200).json({
      EM: diagnosis.EM,
      EC: diagnosis.EC,
      DT: diagnosis.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EM: res.EM,
      EC: -1,
      DT: [],
    });
  }
};

const sendPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionsService.sendPrescription(req.params.id,req.body);
    return res.status(200).json({
      EM: prescription.EM,
      EC: prescription.EC,
      DT: prescription.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EM: res.EM,
      EC: -1,
      DT: [],
    });
  }
};

export default {
  createPrescription,
  getPrescriptionByAppointmentId,
  deletePrescription,
  updatePrescription,
sendPrescription
};
