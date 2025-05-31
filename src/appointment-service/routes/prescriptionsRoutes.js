import express from "express";
import  prescriptionsController from "../controllers/prescriptionsController.js";
const router = express.Router();

router.post("/prescription", prescriptionsController.createPrescription);
 router.get("/:appointmentId/prescription", prescriptionsController.getPrescriptionByAppointmentId);
  router.put("/prescription/:id", prescriptionsController.updatePrescription);
 router.delete("/prescription/:id", prescriptionsController.deletePrescription);
 router.post("/prescription/:id/send", prescriptionsController.sendPrescription);

export default router;