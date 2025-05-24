import express from "express";
import userController from "../controllers/userController";
import { authenticateToken, checkRole } from "../middleware/auth";

const router = express.Router();

router.post("/register", userController.register);

router.post("/verify-otp", userController.verifyOtp);

router.post("/resend-otp", userController.resendOtp);

router.post("/login", userController.login);

router.post("/logout", authenticateToken, userController.logout);

router.post("/change-password", userController.changePassword);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset-password", userController.resetPassword);

router.get("/profile/:userId", userController.getProfile);

router.put("/profile/:userId", userController.updateProfile);

router.get("/", userController.getAllUsers);

router.get("/:userId", userController.getUserById);

router.put("/:userId", userController.updateRoleUser);

router.delete("/:userId", userController.deleteUser);

router.post("/create", userController.createNewUser);

export default router;
