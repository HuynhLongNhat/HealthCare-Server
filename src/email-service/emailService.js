import nodemailer from "nodemailer";
require("dotenv").config();
const dns = require("dns");
const { promisify } = require("util");
const resolveMxAsync = promisify(dns.resolveMx);
// Cấu hình chi tiết cho Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    // Log thông tin để debug
    console.log("Email Configuration:", {
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
    });

    const mailOptions = {
      from: process.env.SMTP_USER, // Sử dụng SMTP_USER thay vì SMTP_FROM
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    // Log chi tiết lỗi
    console.error("Detailed email error:", {
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    return await sendEmail(email, "Password Reset Request", html);
  } catch (error) {
    console.error("Password reset email error:", error);
    throw error; // Ném lỗi để xử lý ở tầng controller
  }
};
const sendAppointmentConfirmationEmail = async (
  patientEmail,
  appointmentDetails
) => {
  try {
    const html = `
      <h1>Xác nhận đặt lịch khám</h1>
      <p>Xin chào,</p>
      <p>Lịch hẹn khám của bạn đã được đặt thành công với thông tin như sau:</p>
      <ul>
        <li>Bác sĩ: ${appointmentDetails.DT.doctorInfor.full_name}</li>
        <li>Chuyên khoa: ${appointmentDetails.DT.doctorInfor.specialization.name}</li>
        <li>Ngày khám: ${appointmentDetails.DT.appointment_date}</li>
        <li>Thời gian: ${appointmentDetails.DT.start_time} - ${appointmentDetails.DT.end_time}</li>
        <li>Địa chỉ: ${appointmentDetails.DT.doctorInfor.address}</li>
      </ul>
      <p>Vui lòng đến đúng giờ để được phục vụ tốt nhất.</p>
      <p>Xin cảm ơn!</p>
    `;

    return await sendEmail(
      patientEmail,
      "Xác nhận đặt lịch khám thành công",
      html
    );
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error);
    throw error;
  }
};

const sendAppointmentCancellationEmail = async (
  patientEmail,
  appointmentDetails
) => {
  try {
    const html = `
      <h1>Thông báo hủy lịch khám</h1>
      <p>Xin chào,</p>
      <p>Lịch hẹn khám của bạn đã được hủy với thông tin như sau:</p>
      <ul>
        <li>Bác sĩ: ${appointmentDetails.DT.doctorInfor.full_name}</li>
        <li>Ngày khám: ${appointmentDetails.DT.appointment_date}</li>
        <li>Thời gian: ${appointmentDetails.DT.start_time} - ${
      appointmentDetails.DT.end_time
    }</li>
        <li>Lý do hủy: ${
          appointmentDetails.DT.cancellation_reason || "Không có"
        }</li>
      </ul>
      <p>Bạn có thể đặt lịch khám mới trên hệ thống của chúng tôi.</p>
      <p>Xin cảm ơn!</p>
    `;

    return await sendEmail(patientEmail, "Thông báo hủy lịch khám", html);
  } catch (error) {
    console.error("Error sending appointment cancellation email:", error);
    throw error;
  }
};

const sendAppointmentApprovalEmail = async (
  patientEmail,
  appointmentDetails
) => {
  try {
    const html = `
      <h1>Xác nhận chấp nhận lịch khám</h1>
      <p>Xin chào,</p>
      <p>Lịch hẹn khám của bạn đã được bác sĩ chấp nhận với thông tin như sau:</p>
      <ul>
        <li>Bác sĩ: ${appointmentDetails.DT.doctorInfor.full_name}</li>
        <li>Chuyên khoa: ${appointmentDetails.DT.doctorInfor.specialization.name}</li>
        <li>Ngày khám: ${appointmentDetails.DT.appointment_date}</li>
        <li>Thời gian: ${appointmentDetails.DT.start_time} - ${appointmentDetails.DT.end_time}</li>
        <li>Địa chỉ: ${appointmentDetails.DT.doctorInfor.address}</li>
      </ul>
      <p>Vui lòng đến đúng giờ để được phục vụ tốt nhất.</p>
      <p>Xin cảm ơn!</p>
    `;

    return await sendEmail(patientEmail, "Xác nhận chấp nhận lịch khám", html);
  } catch (error) {
    console.error("Error sending appointment approval email:", error);
    throw error;
  }
};

const sendAppointmentRejectionEmail = async (
  patientEmail,
  appointmentDetails
) => {
  try {
    const html = `
      <h1>Thông báo từ chối lịch khám</h1>
      <p>Xin chào,</p>
      <p>Rất tiếc, lịch hẹn khám của bạn đã bị từ chối với thông tin như sau:</p>
      <ul>
        <li>Bác sĩ: ${appointmentDetails.DT.doctorInfor.full_name}</li>
        <li>Ngày khám: ${appointmentDetails.DT.appointment_date}</li>
        <li>Thời gian: ${appointmentDetails.DT.start_time} - ${
      appointmentDetails.DT.end_time
    }</li>
        <li>Lý do từ chối: ${
          appointmentDetails.DT.rejection_reason || "Không có"
        }</li>
      </ul>
      <p>Bạn có thể đặt lịch khám mới với bác sĩ khác hoặc thời gian khác trên hệ thống của chúng tôi.</p>
      <p>Xin cảm ơn!</p>
    `;

    return await sendEmail(patientEmail, "Thông báo từ chối lịch khám", html);
  } catch (error) {
    console.error("Error sending appointment rejection email:", error);
    throw error;
  }
};

const sendVerificationEmail = async (email, otpCode) => {
  try {
    const html = `
      <h1>Xác thực tài khoản</h1>
      <p>Xin chào,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP sau để xác thực tài khoản của bạn:</p>
      <div style="background-color: #f4f4f4; padding: 10px; margin: 20px 0; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
        ${otpCode}
      </div>
      <p>Mã OTP này sẽ hết hạn sau 15 phút.</p>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
      <p>Xin cảm ơn!</p>
    `;

    return await sendEmail(email, "Xác thực tài khoản của bạn", html);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

async function verifyEmailExistence(email) {
  const parts = email.split("@");
  if (parts.length !== 2) {
    return false;
  }
  const domain = parts[1];

  try {
    const addresses = await resolveMxAsync(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
}
// Kiểm tra kết nối SMTP khi khởi động
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verification Error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail,
  sendAppointmentApprovalEmail,
  sendAppointmentRejectionEmail,
  sendVerificationEmail,
  verifyEmailExistence,
};
