import dianoisesService from "../services/diagnosisService";
const createDiagnosis = async (req, res) => {
  try {
    const diagnosis = await dianoisesService.createDiagnosis(req.body);
    return res.status(200).json({
      EM: diagnosis.EM,
      EC: diagnosis.EC,
      DT: diagnosis.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EM: error.message,
      EC: -1,
      DT: [],
    });
  }
};

const getDiagnosisByAppointmentId = async (req, res) => {
  try {
    const diagnosis = await dianoisesService.getDiagnosisByAppointmentId(
      req.params.appointmentId
    );
     return res.status(200).json({
      EM: diagnosis.EM,
      EC: diagnosis.EC,
      DT: diagnosis.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EM: error.message,
      EC: -1,
      DT: [],
    });
  }
};

const updateDiagnosis = async (req, res) => {
  try {
    const diagnosis = await dianoisesService.updateDiagnosis(
      req.params.id,
      req.body
    );
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

const deleteDiagnosis = async (req, res) => {
  try {
    const diagnosis = await dianoisesService.deleteDiagnosis(req.params.id);
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


export default {
  createDiagnosis,
  getDiagnosisByAppointmentId,
  deleteDiagnosis,
  updateDiagnosis
};
