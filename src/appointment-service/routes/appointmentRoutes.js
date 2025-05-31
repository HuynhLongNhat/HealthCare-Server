import express from "express";
import appointmentController from "../controllers/appointmentController";

const router = express.Router();

router.post(
  "/",
  appointmentController.createAppointment
);


router.get(
  "/all/:userId",
  appointmentController.getAllAppointments
);


router.get(
  "/:id",
  appointmentController.getAppointmentDetail
);
router.patch(
  "/:id/cancel",
  appointmentController.cancelAppointment
);

router.patch(
  "/:id/approve",
  appointmentController.approveAppointment
);

router.patch(
  "/:id/reject",
  appointmentController.rejectAppointment
);


router.post("/create-payment-link", appointmentController.generatePaymentLink);

router.put(
  "/:id/confirmPayment",
  appointmentController.confirmPayment
);


export default router;
