import express from "express";
import  dianoisesController from "../controllers/diagnosisController.js";
const router = express.Router();

router.post("/diagnosis", dianoisesController.createDiagnosis);
router.get("/:appointmentId/diagnosis", dianoisesController.getDiagnosisByAppointmentId);
 router.put("/diagnosis/:id", dianoisesController.updateDiagnosis);
router.delete("/diagnosis/:id", dianoisesController.deleteDiagnosis);

export default router;