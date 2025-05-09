import userService from "../services/userService";

const userController = {
  // Auth Controllers
  register: async (req, res) => {
    try {
      const { username, email, password, full_name, phone_number } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({
          EM: "Missing required fields",
          EC: 1,
          DT: [],
        });
      }
      const data = await userService.register({
        username,
        email,
        password,
        full_name,
        phone_number,
      });
      return res.status(data.EC === 0 ? 201 : 400).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Internal server error: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },
  verifyOtp: async (req, res) => {
    try {
      const { email, otpCode } = req.body;
      if (!email || !otpCode) {
        return res.status(400).json({
          EM: "Missing required fields",
          EC: 1,
          DT: [],
        });
      }
      const data = await userService.verifyOtp({ email, otpCode });
      return res.status(data.EC === 0 ? 200 : 400).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Internal server error: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },
  resendOtp: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await userService.resendOtp(email);
      // Nếu có lỗi xảy ra từ service
      if (result.EC !== 0) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      return res.status(500).json({
        EM: "Internal server error",
        EC: -1,
        DT: [],
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.cookie("token", result.DT.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  logout: async (req, res) => {
    const { refreshToken } = req.body;
    try {
      const result = await userService.logout(refreshToken);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.userId;
      const result = await userService.changePassword(
        userId,
        oldPassword,
        newPassword
      );
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await userService.forgotPassword(email);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          message: "Token và mật khẩu mới là bắt buộc",
        });
      }

      const result = await userService.resetPassword(token, newPassword);

      return res.status(200).json({
        message: "Mật khẩu đã được cập nhật thành công",
        data: result,
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(400).json({
        message: error.message || "Không thể cập nhật mật khẩu",
      });
    }
  },

  // Profile Controllers
  getProfile: async (req, res) => {
    try {
      const userId = req.params.userId;
      const profile = await userService.getUserProfile(userId);
      return res.status(200).json({
        EM: profile.EM,
        EC: profile.EC,
        DT: profile.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.params.userId;

      const updatedProfile = await userService.updateProfile(userId, req.body);
      return res.status(200).json({
        EM: updatedProfile.EM,
        EC: updatedProfile.EC,
        DT: updatedProfile.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  // Role Management Controllers
  getAllUsers: async (req, res) => {
    try {
      const users = await userService.getAllUsers();

      return res.status(200).json({
        EM: users.EM,
        EC: users.EC,
        DT: users.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);
      return res.status(200).json({
        EM: user.EM,
        EC: user.EC,
        DT: user.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  updateRoleUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const newRole = req.body;
      const updatedUser = await userService.updateRoleUser(userId, newRole.id);
      return res.status(200).json({
        EM: updatedUser.EM,
        EC: updatedUser.EC,
        DT: updatedUser.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },
  createNewUser: async (req, res) => {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(200).json({
        EM: newUser.EM,
        EC: newUser.EC,
        DT: newUser.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      let user = await userService.deleteUser(userId);

      return res.status(200).json({
        EM: user.EM,
        EC: user.EC,
        DT: user.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      });
    }
  },
};

export default userController;
