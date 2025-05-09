import express from "express";
import userController from "../controllers/userController";
import { authenticateToken, checkRole } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *               full_name:
 *                 type: string
 *                 description: Full name of the user.
 *               phone_number:
 *                 type: string
 *                 description: User's phone number.
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Message from the server.
 *                 EC:
 *                   type: integer
 *                   description: Error code (0 for success).
 *                 DT:
 *                   type: array
 *                   description: Data returned from the registration process.
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Error message.
 *                 EC:
 *                   type: integer
 *                   description: Error code.
 *                 DT:
 *                   type: array
 *                   description: Data payload (usually empty).
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Error message.
 *                 EC:
 *                   type: integer
 *                   description: Error code.
 *                 DT:
 *                   type: array
 *                   description: Data payload (usually empty).
 */

router.post("/register", userController.register);

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verify OTP code for account user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otpCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Địa chỉ email của người dùng cần xác thực.
 *               otpCode:
 *                 type: string
 *                 description: Mã OTP được gửi đến email của người dùng.
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Thông báo thành công.
 *                 EC:
 *                   type: integer
 *                   description: Mã lỗi (0 nếu thành công).
 *                 DT:
 *                   type: object
 *                   description: Dữ liệu trả về (ví dụ thông tin tài khoản đã xác thực).
 *       400:
 *         description: OTP không hợp lệ hoặc thiếu các trường yêu cầu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Thông báo lỗi.
 *                 EC:
 *                   type: integer
 *                   description: Mã lỗi.
 *                 DT:
 *                   type: array
 *                   description: Dữ liệu trả về (thường để trống).
 *       500:
 *         description: Lỗi hệ thống.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Thông báo lỗi.
 *                 EC:
 *                   type: integer
 *                   description: Mã lỗi.
 *                 DT:
 *                   type: array
 *                   description: Dữ liệu trả về (thường để trống).
 */

router.post("/verify-otp", userController.verifyOtp);

/**
 * @swagger
 * /api/users/resend-otp:
 *   post:
 *     summary: Resend OTP to the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user requesting a new OTP.
 *     responses:
 *       200:
 *         description: OTP has been successfully resent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Success message.
 *                 EC:
 *                   type: integer
 *                   description: Error code (0 means success).
 *                 DT:
 *                   type: array
 *                   description: Returned data (usually empty).
 *       400:
 *         description: Invalid request or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Error message.
 *                 EC:
 *                   type: integer
 *                   description: Error code.
 *                 DT:
 *                   type: array
 *                   description: Returned data (usually empty).
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   description: Error message.
 *                 EC:
 *                   type: integer
 *                   description: Error code.
 *                 DT:
 *                   type: array
 *                   description: Returned data (usually empty).
 */

router.post("/resend-otp", userController.resendOtp);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", authenticateToken, userController.logout);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/change-password",
  authenticateToken,
  userController.changePassword
);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset instructions sent
 *       400:
 *         description: Invalid input
 */
router.post("/forgot-password", userController.forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token sent to the user's email
 *               newPassword:
 *                 type: string
 *                 description: New password for the account
 *     responses:
 *       200:
 *         description: Password successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password successfully reset
 *       400:
 *         description: Invalid input or token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid token or password
 *       500:
 *         description: Server error
 */
router.post("/reset-password", userController.resetPassword);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
router.get("/profile/:userId", userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, OTHER]
 *               address:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile/:userId", userController.updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user details (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/:userId", userController.getUserById);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_role:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:userId", userController.updateRoleUser);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:userId", userController.deleteUser);

router.post("/create", userController.createNewUser);

export default router;
