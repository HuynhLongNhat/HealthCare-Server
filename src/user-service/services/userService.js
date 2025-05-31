import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../models/index";
import emailService from "../../email-service/emailService";
import { Op } from "sequelize";
import { generateNewOTP } from "../../utils/otpUtis";
import crypto from "crypto";
class UserService {
  async register(userData) {
    const transaction = await db.sequelize.transaction();
    try {
      const { username, email, password, full_name } = userData;
      const existingUser = await db.users.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
        transaction,
      });

      if (existingUser) {
        return {
          EM: "Email, username is existing!",
          EC: -1,
          DT: [],
        };
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 3. Create user
      const newUser = await db.users.create(
        {
          uuid: uuidv4(),
          username,
          email,
          password: hashedPassword,
          role_id: 3,
          full_name,
          isVerified: false,
        },
        { transaction }
      );

      const { otpCode, otpExpiration } = generateNewOTP();

      await db.otps.create(
        {
          user_id: newUser.id,
          otp_code: otpCode,
          purpose: "signup",
          expiration_time: otpExpiration,
        },
        { transaction }
      );
      await transaction.commit();
      await emailService.sendVerificationEmail(email, otpCode);
      return {
        EM: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực",
        EC: 0,
        DT: {
          uuid: newUser.uuid,
          email: newUser.email,
        },
      };
    } catch (error) {
      await transaction.rollback();
      console.error("Registration Error:", error);
      return {
        EM: error,
        EC: -2,
        DT: [],
      };
    }
  }
  async verifyOtp({ email, otpCode }) {
    try {
      const user = await db.users.findOne({ where: { email } });
      if (!user) {
        return {
          EM: "Không tìm thấy người dùng",
          EC: 1,
          DT: [],
        };
      }

      const otpRecord = await db.otps.findOne({
        where: {
          user_id: user.id,
          otp_code: otpCode,
          purpose: "signup",
          is_used: false,
        },
      });

      if (!otpRecord) {
        return {
          EM: "Mã OTP không hợp lệ hoặc đã được sử dụng",
          EC: 2,
          DT: [],
        };
      }

      const currentTime = new Date();
      if (currentTime > new Date(otpRecord.expiration_time)) {
        return {
          EM: "Mã OTP đã hết hạn",
          EC: 3,
          DT: [],
        };
      }
      user.is_verified = true;
      await user.save();
      await db.otps.update({ is_used: true }, { where: { id: otpRecord.id } });
      return {
        EM: "Xác thực thành công. Tài khoản của bạn đã được kích hoạt.",
        EC: 0,
        DT: { email: user.email },
      };
    } catch (error) {
      console.error("Verify OTP Error:", error);
      return {
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      };
    }
  }
  async resendOtp(email) {
    const transaction = await db.sequelize.transaction();
    try {
      // Kiểm tra xem user có tồn tại không
      const user = await db.users.findOne({ where: { email } });

      if (!user) {
        return {
          EM: "User not found",
          EC: 1,
          DT: [],
        };
      }

      // Xóa OTP cũ của user
      await db.otps.destroy({
        where: {
          user_id: user.id,
          purpose: "signup",
          is_used: false,
        },
        transaction,
      });
      const { otpCode, otpExpiration } = generateNewOTP();

      await db.otps.create(
        {
          user_id: user.id,
          otp_code: otpCode,
          purpose: "signup",
          expiration_time: otpExpiration,
          is_used: false,
        },
        { transaction }
      );

      await transaction.commit();

      // Gửi lại email OTP
      await emailService.sendVerificationEmail(email, otpCode);

      return {
        EM: "OTP has been resent successfully. Please check your email.",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      await transaction.rollback();
      console.error("Resend OTP Error:", error);
      return {
        EM: "System error: " + error.message,
        EC: -1,
        DT: [],
      };
    }
  }
  async login(data) {
  try {
    const user = await db.users.findOne({
      where: { email: data.email }
    });
    if (!user) {
      return { EM: "Thông tin đăng nhập không chính xác!", EC: -1, DT: [] };
    }
     if (!user.password) {
      return {
        EM: "Tài khoản này đã được đăng ký bằng phương thức khác (Google, Facebook...). Vui lòng sử dụng đúng phương thức đăng nhập.",
        EC: -3,
        DT: [],
      };
    }
    const isMatch =  await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { EM: "Thông tin đăng nhập không chính xác!", EC: -1, DT: [] };
    }

    if (!user.is_verified) {
      return { EM: "Tài khoản chưa xác thực", EC: -2, DT: [] };
    }

    const accessToken = jwt.sign(
      {
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role_id,
        userId: user.id,
        avatar: user.profile_picture,
      },
      process.env.JWT_SECRET
    );

    return {
      EM: "Đăng nhập thành công",
      EC: 0,
      DT: {
        accessToken,
        user: {
          email: user.email,
          role: user.role_id,
          userId: user.id,
          avatar: user.profile_picture,
        },
      },
    };
  } catch (error) {
    return { EM: "Lỗi hệ thống: " + error.message, EC: -3, DT: [] };
  }
}


  async logout(refreshToken) {
    try {
      if (!refreshToken) {
        return { EM: "Thiếu token", EC: -1 };
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      const tokenRecord = await db.refresh_tokens.findOne({
        where: { token: hashedToken },
      });

      if (!tokenRecord) {
        return { EM: "Token không hợp lệ hoặc đã hết hạn", EC: -2 };
      }

      tokenRecord.revoked = true;
      await tokenRecord.save();

      return { EM: "Đăng xuất thành công", EC: 0 };
    } catch (error) {
      console.error("Error during logout:", error);
      return { EM: "Lỗi hệ thống, vui lòng thử lại sau.", EC: -1 };
    }
  }
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await db.users.findByPk(userId);
      if (!user) {
        return {
          EM: "Không tìm thấy người dùng!",
          EC: -1,
          DT: [],
        };
      }

      // Verify old password
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        return {
          EM: "Mật khẩu cũ không đúng!",
          EC: -2,
          DT: [],
        };
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      return {
        EM: "Mật khẩu được đổi thành công!",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống : " + error.message,
        EC: -3,
        DT: [],
      };
    }
  }

  async forgotPassword(email) {
    try {
      const user = await db.users.findOne({ where: { email } });
      if (!user) {
        return {
          EM: "Email không tồn tại trong hệ thống!",
          EC: -1,
          DT: [],
        };
      }
      // Generate reset token
      const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      await emailService.sendPasswordResetEmail(email, resetToken);
      return {
        EM: "Nhấn vào link xác nhận trong email để đổi mật khẩu",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống : " + error.message,
        EC: -2,
        DT: [],
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Tìm user
      const user = await db.users.findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error("Không tìm thấy người dùng");
      }

      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật mật khẩu
      await user.update({
        password: hashedPassword,
      });

      return {
        success: true,
        message: "Mật khẩu đã được cập nhật thành công",
      };
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new Error("Token không hợp lệ hoặc đã hết hạn");
      }
      throw new Error("Không thể cập nhật mật khẩu: " + error.message);
    }
  }

  async getUserProfile(userId) {
    try {
      const profile = await db.users.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
      });

      if (!profile) {
        return {
          EM: "Không tìm thấy người dùng!",
          EC: -1,
          DT: [],
        };
      }
      return {
        EM: "Thông tin người dùng",
        EC: 0,
        DT: profile,
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      };
    }
  }

  async updateProfile(userId, profileData) {
    try {
      const userProfile = await db.users.findOne({
        where: { id: userId },
      });

      if (!userProfile) {
        return {
          EM: "Không tìm thấy người dùng!",
          EC: -1,
          DT: [],
        };
      }

      // Kiểm tra trùng số điện thoại
      if (
        profileData.phone_number &&
        profileData.phone_number !== userProfile.phone_number
      ) {
        const existingPhone = await db.users.findOne({
          where: {
            phone_number: profileData.phone_number,
            id: { [db.Sequelize.Op.ne]: userId },
          },
        });

        if (existingPhone) {
          return {
            EM: "Số điện thoại đã được sử dụng bởi người dùng khác!",
            EC: -2,
            DT: [],
          };
        }
      }

      let userUpdate = await userProfile.update(profileData);
      if (!userUpdate) {
        return {
          EM: "Không thể cập nhật thông tin người dùng!",
          EC: -1,
          DT: [],
        };
      }

      return {
        EM: "Thông tin người dùng đã được cập nhật thành công!",
        EC: 0,
        DT: userUpdate,
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      };
    }
  }

  async getAllUsers() {
    try {
      const users = await db.users.findAll({
        include: [
          {
            model: db.roles,
            as: "role",
          },
        ],
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
      });
      if (!users) {
        return {
          EM: "Không tìm thấy người dùng!",
          EC: -1,
          DT: [],
        };
      }
      return {
        EM: "Lấy danh sách người dùng thành công!",
        EC: 0,
        DT: users,
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      };
    }
  }

  async getUserById(userId) {
    try {
      const user = await db.users.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return {
          EM: "Không tìm thấy người dùng!",
          EC: -1,
          DT: [],
        };
      }
      return {
        EM: "Lấy thông tin người dùng thành công!",
        EC: 0,
        DT: user,
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống: " + error.message,
        EC: -1,
        DT: [],
      };
    }
  }
  async updateRoleUser(userId, newRole) {
    try {
      const user = await db.users.findOne({
        where: { id: userId },
      });

      if (!user) {
        return {
          EM: "Không tìm thấy người dùng!",
          EC: -1,
          DT: [],
        };
      }
      // Cập nhật role
      await user.update({ role_id: newRole });
      return {
        EM: "Role đã được cập nhật thành công!",
        EC: 0,
        DT: "",
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống:" + error.message,
        EC: -1,
        DT: [],
      };
    }
  }
  createUser = async (userData) => {
    try {
      const { username, email, password, fullname, phone, address, role_id } =
        userData;

      // 🔍 Kiểm tra trùng email / username / phone
      const existingUser = await db.users.findOne({
        where: {
          [Op.or]: [
            { email: email },
            { username: username },
            { phone_number: phone },
          ],
        },
      });

      if (existingUser) {
        return {
          EM: "Email, username hoặc số điện thoại đã tồn tại!",
          EC: -1,
          DT: [],
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.users.create({
        uuid: uuidv4(),
        username: username || null,
        password: hashedPassword,
        email: email || null,
        full_name: fullname || null,
        phone_number: phone || null,
        is_verified: false,
        address: address || null,
        profile_picture: null,
        dob: null,
        gender: null,
        role_id: role_id || 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        EM: "Thêm mới người dùng thành công",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      console.error("Sequelize Error:", error);
      return {
        EM: "Lỗi hệ thống: " + (error.errors?.[0]?.message || error.message),
        EC: -2,
        DT: [],
      };
    }
  };

  async deleteUser(userId) {
    try {
      const result = await db.users.destroy({
        where: { id: userId },
      });

      if (result) {
        return {
          EM: "Xóa người dùng thành công!",
          EC: 0,
          DT: [],
        };
      } else {
        return {
          EM: "Người dùng không tồn tại.",
          EC: -1,
          DT: [],
        };
      }
    } catch (error) {
      return {
        EM: "Lỗi hệ thống: " + error.message,
        EC: -2,
        DT: [],
      };
    }
  }
}

export default new UserService();
