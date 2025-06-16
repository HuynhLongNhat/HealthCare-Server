import express from "express";
import userController from "../controllers/user.controller";
import { authenticateToken, checkRole } from "../middleware/auth";

const router = express.Router();


// Auth Routes
router.post("/register", userController.register);

router.post("/verify-otp", userController.verifyOtp);

router.post("/resend-otp", userController.resendOtp);

router.post("/login", userController.login);

router.post("/logout",  userController.logout);

router.post("/:userId/change-password", userController.changePassword);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset-password", userController.resetPassword);


// User Routes
router.get("/profile/:username", userController.getProfile);

router.put("/profile/:userId", userController.updateProfile);

router.get("/", userController.getAllUsers);

router.get("/:userId", userController.getUserById);

router.put("/:userId", userController.updateRoleUser);

router.delete("/:userId", userController.deleteUser);

router.post("/create", userController.createNewUser);

export default router;
