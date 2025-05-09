import express from "express";
import appointmentController from "../controllers/appointmentController";
import { authenticateToken, checkRole } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Đặt lịch khám mới
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - appointment_date
 *               - note
 *               - start_time
 *               - end_time
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 description: Mã bác sĩ
 *               appointment_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày lịch hẹn
 *               note:
 *                 type: string
 *                 description: Ghi chú
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Thời gian bắt đầu
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: Thời gian kết thúc
 *     responses:
 *       201:
 *         description: Lịch hẹn được tạo thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi server
 */

router.post(
  "/",
  authenticateToken,
  checkRole(["PATIENT" ,"DOCTOR" , "ADMIN"]),
  appointmentController.createAppointment
);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Xem danh sách lịch hẹn 
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Lấy danh sách lịch hẹn thành công
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.get(
  "/",
  authenticateToken,
  checkRole(["ADMIN", "DOCTOR" , "PATIENT"]),
  appointmentController.getAllAppointments
);


/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Xem chi tiết lịch hẹn
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     responses:
 *       200:
 *         description: Lấy chi tiết lịch hẹn thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy lịch hẹn
 *       500:
 *         description: Lỗi server
 */
router.get(
  "/:id",
  authenticateToken,
  checkRole(["ADMIN", "DOCTOR", "PATIENT"]),
  appointmentController.getAppointmentDetail
);


/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Hủy lịch hẹn ( Patient)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cancel_reason
 *             properties:
 *               cancel_reason:
 *                 type: string
 *                 description: Lý do hủy lịch hẹn
 *     responses:
 *       200:
 *         description: Hủy lịch hẹn thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy lịch hẹn
 *       500:
 *         description: Lỗi server
 */
router.patch(
  "/:id/cancel",
  authenticateToken,
  checkRole(["PATIENT"]),
  appointmentController.cancelAppointment
);

/**
 * @swagger
 * /api/appointments/{id}/approve:
 *   patch:
 *     summary: Đồng ý lịch hẹn (Admin , doctor)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     responses:
 *       200:
 *         description: Đồng ý lịch hẹn thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy lịch hẹn
 *       500:
 *         description: Lỗi server
 */
router.patch(
  "/:id/approve",
  authenticateToken,
  checkRole(["ADMIN", "DOCTOR"]),
  appointmentController.approveAppointment
);

/**
 * @swagger
 * /api/appointments/{id}/reject:
 *   patch:
 *     summary: Từ chối lịch hẹn ( Admin , Doctor)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reject_reason
 *             properties:
 *               reject_reason:
 *                 type: string
 *                 description: Lý do từ chối lịch hẹn
 *     responses:
 *       200:
 *         description: Từ chối lịch hẹn thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy lịch hẹn
 *       500:
 *         description: Lỗi server
 */
router.patch(
  "/:id/reject",
  authenticateToken,
  checkRole(["ADMIN", "DOCTOR"]),
  appointmentController.rejectAppointment
);

export default router;

