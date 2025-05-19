import express from "express";
import paymentController from "../controllers/paymentController";
const router = express.Router();


router.post("/", paymentController.createNewPayment);

router.post("/paymentForCash", paymentController.createNewPaymentForCash);

router.get("/all/:userId", paymentController.getAllPayment);
router.get("/:paymentId", paymentController.getPaymentDetail);
router.get("/appointment/:appointmentId", paymentController.getPaymentByAppointmentId);

router.post("/:orderId/callback", paymentController.updateStatusPayment);
export default router;

