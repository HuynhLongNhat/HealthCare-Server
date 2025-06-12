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
      from: process.env.SMTP_USER, 
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
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        padding: 40px 0;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 30px;
        ">
          <h2 style="
            text-align: center;
            color: #2c3e50;
            margin-bottom: 24px;
          ">
            🛡️ Yêu cầu đặt lại mật khẩu
          </h2>

          <p style="font-size: 16px; color: #333;">
            Xin chào,
          </p>

          <p style="font-size: 16px; color: #333;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="
              background-color: #4a90e2;
              color: #fff;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            ">
              Đặt lại mật khẩu
            </a>
          </div>

          <p style="font-size: 14px; color: #555;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
          </p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

          <p style="font-size: 12px; color: #999; text-align: center;">
            Liên kết đặt lại mật khẩu sẽ hết hạn sau 1 giờ vì lý do bảo mật.
          </p>
        </div>

        <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
          © ${new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    `;

    return await sendEmail(email, "🛡️ Yêu cầu đặt lại mật khẩu", html);
  } catch (error) {
    console.error("Lỗi gửi email đặt lại mật khẩu:", error);
    throw error;
  }
};

// Gửi cho bệnh nhân và bấc sĩ  về xác nhận đặt lịch
const sendAppointmentConfirmationEmail = async (
  recipientEmail,
  appointmentDetails,
  isDoctor
) => {
  try {
    const patientName = appointmentDetails.DT.patientData?.full_name || '---';
    const doctorName =
      appointmentDetails.DT.doctorData?.userData?.full_name || '---';
    const specialization =
      appointmentDetails.DT.doctorData?.doctor?.specialization?.name || '---';
    const examDate =
      appointmentDetails.DT.scheduleData?.schedule?.date || '---';
    const timeStart =
      appointmentDetails.DT.scheduleData?.schedule?.time_start || '---';
    const timeEnd =
      appointmentDetails.DT.scheduleData?.schedule?.time_end || '---';
    const reason =
      appointmentDetails.DT.appointment?.medical_examination_reason || '---';
    const clinicName = appointmentDetails.DT.clinicData?.name || '---';
    const clinicAddress = appointmentDetails.DT.clinicData?.address || '---';
    const fee = appointmentDetails.DT.doctorData?.doctor?.consultation_fee
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          minimumFractionDigits: 0,
        }).format(appointmentDetails.DT.doctorData?.doctor?.consultation_fee)
      : '---';

    let html = '';

    if (isDoctor) {
      // Nội dung gửi cho bác sĩ
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1976d2; font-weight: 600; margin-bottom: 5px; font-size: 24px;">Thông Báo Lịch Khám Mới</h1>
            <div style="width: 50px; height: 4px; background-color: #1976d2; margin: 0 auto;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin chào <span style="font-weight: 600; color: #1976d2;">${doctorName}</span>,</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Bạn có một cuộc hẹn khám bệnh mới với thông tin như sau:</p>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #1976d2;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Bệnh nhân:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Ngày khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${examDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Giờ khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${timeStart} - ${timeEnd}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Lý do khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px;"><strong style="color: #555;">Phòng khám:</strong></td>
                <td style="padding: 10px 5px;">${clinicName} - ${clinicAddress}</td>
              </tr>
            </table>
          </div>       
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Vui lòng kiểm tra lịch làm việc để chuẩn bị tốt nhất cho cuộc hẹn này.</p>         
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin cảm ơn!</p>
          <div style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #757575; text-align: center;">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `;
    } else {
      // Nội dung gửi cho bệnh nhân
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00897b; font-weight: 600; margin-bottom: 5px; font-size: 24px;">Xác Nhận Lịch Khám</h1>
            <div style="width: 50px; height: 4px; background-color: #00897b; margin: 0 auto;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin chào <span style="font-weight: 600; color: #00897b;">${patientName}</span>,</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Bạn đã đặt lịch khám với thông tin như sau:</p>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #00897b;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Bác sĩ:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${doctorName} <span style="color: #00897b; font-style: italic;">(${specialization})</span></td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Phòng khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${clinicName} - ${clinicAddress}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Ngày khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${examDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Giờ khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${timeStart} - ${timeEnd}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Lý do khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px;"><strong style="color: #555;">Phí khám:</strong></td>
                <td style="padding: 10px 5px; font-weight: 600;">${fee}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e8f5e9; border-radius: 6px; padding: 15px; margin-bottom: 25px; border-left: 4px solid #00897b;">
            <p style="margin: 0; font-size: 15px; color: #2e7d32;"><strong>Lưu ý:</strong> Vui lòng chờ bác sĩ phê duyệt để tiến hành khám bệnh. Xin cảm ơn!.</p>
          </div>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin cảm ơn!</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #757575; text-align: center;">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `;
    }

    return await sendEmail(
      recipientEmail,
      isDoctor ? "Lịch khám mới" : "Xác nhận lịch khám",
      html
    );
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error);
    throw error;
  }
};
// Gửi cho bệnh nhân và bác sĩ về xác nhận hủy lịch lịch
const sendAppointmentCancellationEmail = async (
  recipientEmail,
  appointmentDetails,
  isDoctor
) => {
  try {
    const patientName = appointmentDetails.DT.patientData?.full_name || '---';
    const doctorName =
      appointmentDetails.DT.doctorData?.userData?.full_name || '---';
    const specialization =
      appointmentDetails.DT.doctorData?.doctor?.specialization?.name || '---';
    const examDate =
      appointmentDetails.DT.scheduleData?.schedule?.date || '---';
    const timeStart =
      appointmentDetails.DT.scheduleData?.schedule?.time_start || '---';
    const timeEnd =
      appointmentDetails.DT.scheduleData?.schedule?.time_end || '---';
    const reason =
      appointmentDetails.DT.appointment?.medical_examination_reason || '---';
    const cancel_reason =
      appointmentDetails.DT.appointment?.cancellation_reason || '---';
    const clinicName = appointmentDetails.DT.clinicData?.name || '---';
    const clinicAddress = appointmentDetails.DT.clinicData?.address || '---';
    const fee = appointmentDetails.DT.doctorData?.doctor?.consultation_fee
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          minimumFractionDigits: 0,
        }).format(appointmentDetails.DT.doctorData?.doctor?.consultation_fee)
      : '---';

    let html = '';
    let emailSubject = '';

    // Định nghĩa các màu sắc chung
    const primaryColor = '#e11d48';
    const secondaryColor = '#fef2f2';
    const accentColor = '#9f1239';
    const textColor = '#1e293b';
    const mutedTextColor = '#64748b';

    if (isDoctor) {
      // Nội dung gửi cho bác sĩ
      emailSubject = "🔔 Thông báo hủy lịch hẹn khám";
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);">
          <!-- Header -->
          <div style="position: relative;">
            <div style="background-color: ${primaryColor}; height: 8px;"></div>
            <div style="padding: 30px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: ${secondaryColor}; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; text-align: center; margin-bottom: 16px;">
                <span style="font-size: 36px;">❌</span>
              </div>
              <h1 style="margin: 0 0 10px; color: ${primaryColor}; font-size: 26px; font-weight: 700;">Thông Báo Hủy Lịch Hẹn</h1>
              <p style="margin: 0; color: ${mutedTextColor}; font-size: 16px;">Bệnh nhân đã hủy lịch khám</p>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 0 30px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: ${textColor}; margin-bottom: 24px;">
              Xin chào <span style="font-weight: 600; color: ${accentColor};">BS. ${doctorName}</span>,
              <br><br>
              Bệnh nhân <strong>${patientName}</strong> đã hủy lịch hẹn khám. Dưới đây là chi tiết:
            </p>

            <!-- Appointment Details -->
            <div style="background-color: ${secondaryColor}; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid ${primaryColor};">
              <table style="width: 100%; border-spacing: 0;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px; width: 130px;">Bệnh nhân:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${patientName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Ngày khám:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${examDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Thời gian:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${timeStart} - ${timeEnd}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Lý do khám:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${reason}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Phòng khám:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${clinicName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Địa chỉ:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${clinicAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${mutedTextColor}; font-size: 14px; vertical-align: top;">Lý do hủy:</td>
                  <td style="padding: 10px 0; color: ${primaryColor}; font-weight: 500;">${cancel_reason}</td>
                </tr>
              </table>
            </div>

            <!-- Notice Box -->
            <div style="background-color: #fff8f1; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #f97316; text-align: center;">
              <p style="margin: 0; color: #9a3412; font-weight: 500; font-size: 15px;">
                Khung giờ này đã được mở lại trong lịch làm việc của bạn.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: ${mutedTextColor}; font-size: 14px; margin-bottom: 16px;">
                Cảm ơn bác sĩ đã đồng hành cùng hệ thống!
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Đây là email tự động, vui lòng không phản hồi.
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Nội dung gửi cho bệnh nhân
      emailSubject = "🔔 Thông báo hủy lịch khám thành công";
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);">
          <!-- Header -->
          <div style="position: relative;">
            <div style="background-color: ${primaryColor}; height: 8px;"></div>
            <div style="padding: 30px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: ${secondaryColor}; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; text-align: center; margin-bottom: 16px;">
                <span style="font-size: 36px;">❌</span>
              </div>
              <h1 style="margin: 0 0 10px; color: ${primaryColor}; font-size: 26px; font-weight: 700;">Xác Nhận Hủy Lịch Khám</h1>
              <p style="margin: 0; color: ${mutedTextColor}; font-size: 16px;">Lịch hẹn của bạn đã được hủy thành công</p>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 0 30px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: ${textColor}; margin-bottom: 24px;">
              Xin chào <span style="font-weight: 600; color: ${accentColor}">${patientName}</span>,
              <br><br>
              Lịch hẹn khám của bạn đã được <strong>hủy thành công</strong>. Dưới đây là chi tiết:
            </p>

            <!-- Appointment Details -->
            <div style="background-color: ${secondaryColor}; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid ${primaryColor};">
              <table style="width: 100%; border-spacing: 0;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px; width: 130px;">Bác sĩ:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${doctorName} <span style="color: ${mutedTextColor}; font-style: italic; font-size: 14px;">(${specialization})</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Phòng khám:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${clinicName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Địa chỉ:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${clinicAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Ngày khám:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${examDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Thời gian:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${timeStart} - ${timeEnd}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Lý do khám:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 500;">${reason}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${mutedTextColor}; font-size: 14px;">Phí khám:</td>
                  <td style="padding: 10px 0; border-bottom: 1px dashed rgba(203, 213, 225, 0.8); color: ${textColor}; font-weight: 600;">${fee}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${mutedTextColor}; font-size: 14px; vertical-align: top;">Lý do hủy:</td>
                  <td style="padding: 10px 0; color: ${primaryColor}; font-weight: 500;">${cancel_reason}</td>
                </tr>
              </table>
            </div>

            <!-- Notice Box -->
            <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #10b981; text-align: center;">
              <p style="margin: 0; color: #065f46; font-weight: 500; font-size: 15px;">
                Bạn có thể đặt lịch khám mới bất cứ lúc nào trên hệ thống của chúng tôi.
              </p>
            </div>

            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="#" style="display: inline-block; background-color: ${primaryColor}; color: white; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; font-size: 16px;">Đặt Lịch Khám Mới</a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: ${mutedTextColor}; font-size: 14px; margin-bottom: 16px;">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Đây là email tự động, vui lòng không phản hồi.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    return await sendEmail(recipientEmail, emailSubject, html);
  } catch (error) {
    console.error("Error sending appointment cancellation email:", error);
    throw error;
  }
};

// Gửi cho bệnh nhân và bác sĩ về việc bác sĩ chấp nhận lịch hẹn
const sendAppointmentApprovalEmail = async (
  recipientEmail,
  appointmentDetails,
  isDoctor
) => {
  try {
    const patientName = appointmentDetails.DT.patientData?.full_name || '---';
    const doctorName =
      appointmentDetails.DT.doctorData?.userData?.full_name || '---';
    const specialization =
      appointmentDetails.DT.doctorData?.doctor?.specialization?.name || '---';
    const examDate =
      appointmentDetails.DT.scheduleData?.schedule?.date || '---';
    const timeStart =
      appointmentDetails.DT.scheduleData?.schedule?.time_start || '---';
    const timeEnd =
      appointmentDetails.DT.scheduleData?.schedule?.time_end || '---';
    const reason =
      appointmentDetails.DT.appointment?.medical_examination_reason || '---';
    const clinicName = appointmentDetails.DT.clinicData?.name || '---';
    const clinicAddress = appointmentDetails.DT.clinicData?.address || '---';
    const fee = appointmentDetails.DT.doctorData?.doctor?.consultation_fee
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          minimumFractionDigits: 0,
        }).format(appointmentDetails.DT.doctorData?.doctor?.consultation_fee)
      : '---';

    let html = '';

    if (isDoctor) {
      // Nội dung gửi cho bác sĩ
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; font-weight: 600; margin-bottom: 5px; font-size: 24px;">Thông Báo Lịch Khám Được Chấp Nhận</h1>
            <div style="width: 50px; height: 4px; background-color: #16a34a; margin: 0 auto;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin chào <span style="font-weight: 600; color: #16a34a;">${doctorName}</span>,</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Bạn đã <span style="font-weight: 600; color: #16a34a;">chấp nhận</span> cuộc hẹn khám bệnh với thông tin như sau:</p>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #16a34a;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Bệnh nhân:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Ngày khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${examDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Giờ khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${timeStart} - ${timeEnd}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Lý do khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px;"><strong style="color: #555;">Phòng khám:</strong></td>
                <td style="padding: 10px 5px;">${clinicName} - ${clinicAddress}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Vui lòng chuẩn bị tốt nhất cho cuộc hẹn này.</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin cảm ơn!</p>
          <div style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #757575; text-align: center;">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `;
    } else {
      // Nội dung gửi cho bệnh nhân
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; font-weight: 600; margin-bottom: 5px; font-size: 24px;">✅ Lịch Hẹn Được Chấp Nhận</h1>
            <div style="width: 50px; height: 4px; background-color: #16a34a; margin: 0 auto;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin chào <span style="font-weight: 600; color: #16a34a;">${patientName}</span>,</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Chúng tôi xin thông báo rằng bác sĩ đã <span style="font-weight: 600; color: #16a34a;">chấp nhận</span> lịch hẹn khám của bạn. Thông tin chi tiết như sau:</p>
          
          <div style="background-color: #f0fdf4; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #16a34a;">
            <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #bbf7d0;">
              <tr>
                <td style="padding: 10px; color: #6b7280; width: 40%; border-bottom: 1px solid #dcfce7;"><strong style="color: #555;">Bác sĩ:</strong></td>
                <td style="padding: 10px; color: #166534; font-weight: 500; border-bottom: 1px solid #dcfce7;">${doctorName} <span style="color: #16a34a; font-style: italic;">(${specialization})</span></td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #dcfce7;"><strong style="color: #555;">Phòng khám:</strong></td>
                <td style="padding: 10px; color: #166534; font-weight: 500; border-bottom: 1px solid #dcfce7;">${clinicName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #dcfce7;"><strong style="color: #555;">Địa chỉ:</strong></td>
                <td style="padding: 10px; color: #166534; font-weight: 500; border-bottom: 1px solid #dcfce7;">${clinicAddress}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #dcfce7;"><strong style="color: #555;">Ngày khám:</strong></td>
                <td style="padding: 10px; color: #166534; font-weight: 500; border-bottom: 1px solid #dcfce7;">${examDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #dcfce7;"><strong style="color: #555;">Thời gian:</strong></td>
                <td style="padding: 10px; color: #166534; font-weight: 500; border-bottom: 1px solid #dcfce7;">${timeStart} - ${timeEnd}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #dcfce7;"><strong style="color: #555;">Lý do khám:</strong></td>
                <td style="padding: 10px; color: #166534; font-weight: 500; border-bottom: 1px solid #dcfce7;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280;"><strong style="color: #555;">Giá khám:</strong></td>
                <td style="padding: 10px; color: #166534; font-weight: 500;">${fee}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 25px; text-align: center; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              Vui lòng đến đúng giờ để được phục vụ tốt nhất. Nếu bạn không thể đến đúng giờ, hãy liên hệ với chúng tôi để thay đổi lịch khám.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">Xin cảm ơn!</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #757575; text-align: center;">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `;
    }

    return await sendEmail(
      recipientEmail,
      isDoctor ? "Lịch khám được chấp nhận" : "✅ Lịch hẹn của bạn đã được chấp nhận",
      html
    );
  } catch (error) {
    console.error("Error sending appointment approval email:", error);
    throw error;
  }
};

// Gửi cho bệnh nhân và bác sĩ về việc bác sẽ từ chối lịch hẹn
const sendAppointmentRejectionEmail = async (
  recipientEmail,
  appointmentDetails,
  isDoctor
) => {
  try {
    const patientName = appointmentDetails.DT.patientData?.full_name || '---';
    const doctorName =
      appointmentDetails.DT.doctorData?.userData?.full_name || '---';
    const specialization =
      appointmentDetails.DT.doctorData?.doctor?.specialization?.name || '---';
    const examDate =
      appointmentDetails.DT.scheduleData?.schedule?.date || '---';
    const timeStart =
      appointmentDetails.DT.scheduleData?.schedule?.time_start || '---';
    const timeEnd =
      appointmentDetails.DT.scheduleData?.schedule?.time_end || '---';
    const reason =
      appointmentDetails.DT.appointment?.medical_examination_reason || '---';
    const clinicName = appointmentDetails.DT.clinicData?.name || '---';
    const clinicAddress = appointmentDetails.DT.clinicData?.address || '---';
    const fee = appointmentDetails.DT.doctorData?.doctor?.consultation_fee
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          minimumFractionDigits: 0,
        }).format(appointmentDetails.DT.doctorData?.doctor?.consultation_fee)
      : '---';
    const rejectionReason =
      appointmentDetails.DT.rejection_reason || 'Không có lý do cụ thể';

    let html = '';

    if (isDoctor) {
      // Nội dung gửi cho bác sĩ
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; font-weight: 600; margin-bottom: 5px; font-size: 24px;">Thông Báo Lịch Khám Đã Từ Chối</h1>
            <div style="width: 50px; height: 4px; background-color: #dc2626; margin: 0 auto;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin chào <span style="font-weight: 600; color: #dc2626;">${doctorName}</span>,</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Bạn đã <span style="font-weight: 600; color: #dc2626;">từ chối</span> cuộc hẹn khám bệnh với thông tin như sau:</p>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #dc2626;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Bệnh nhân:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Ngày khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${examDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Giờ khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${timeStart} - ${timeEnd}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Lý do khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Phòng khám:</strong></td>
                <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${clinicName} - ${clinicAddress}</td>
              </tr>
              <tr>
                <td style="padding: 10px 5px;"><strong style="color: #555;">Lý do từ chối:</strong></td>
                <td style="padding: 10px 5px; color: #dc2626;">${rejectionReason}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hệ thống đã thông báo cho bệnh nhân về việc từ chối lịch khám này.</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin cảm ơn!</p>
          <div style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #757575; text-align: center;">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `;
    } else {
      // Nội dung gửi cho bệnh nhân
      html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; font-weight: 600; margin-bottom: 5px; font-size: 24px;">❌ Thông Báo Từ Chối Lịch Khám</h1>
            <div style="width: 50px; height: 4px; background-color: #dc2626; margin: 0 auto;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Xin chào <span style="font-weight: 600; color: #dc2626;">${patientName}</span>,</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Chúng tôi rất tiếc phải thông báo rằng bác sĩ đã <span style="font-weight: 600; color: #dc2626;">từ chối</span> lịch hẹn khám của bạn. Thông tin chi tiết như sau:</p>
          
          <div style="background-color: #fef2f2; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #dc2626;">
            <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #fecaca;">
              <tr>
                <td style="padding: 10px; color: #6b7280; width: 40%; border-bottom: 1px solid #fee2e2;"><strong style="color: #555;">Bác sĩ:</strong></td>
                <td style="padding: 10px; color: #7f1d1d; font-weight: 500; border-bottom: 1px solid #fee2e2;">${doctorName} <span style="color: #dc2626; font-style: italic;">(${specialization})</span></td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #fee2e2;"><strong style="color: #555;">Phòng khám:</strong></td>
                <td style="padding: 10px; color: #7f1d1d; font-weight: 500; border-bottom: 1px solid #fee2e2;">${clinicName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #fee2e2;"><strong style="color: #555;">Địa chỉ:</strong></td>
                <td style="padding: 10px; color: #7f1d1d; font-weight: 500; border-bottom: 1px solid #fee2e2;">${clinicAddress}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #fee2e2;"><strong style="color: #555;">Ngày khám:</strong></td>
                <td style="padding: 10px; color: #7f1d1d; font-weight: 500; border-bottom: 1px solid #fee2e2;">${examDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #fee2e2;"><strong style="color: #555;">Thời gian:</strong></td>
                <td style="padding: 10px; color: #7f1d1d; font-weight: 500; border-bottom: 1px solid #fee2e2;">${timeStart} - ${timeEnd}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #fee2e2;"><strong style="color: #555;">Lý do khám:</strong></td>
                <td style="padding: 10px; color: #7f1d1d; font-weight: 500; border-bottom: 1px solid #fee2e2;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280; border-bottom: 1px solid #fee2e2;"><strong style="color: #555;">Giá khám:</strong></td>
                <td style="padding: 10px; color: #7f1d1d; font-weight: 500; border-bottom: 1px solid #fee2e2;">${fee}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #6b7280;"><strong style="color: #555;">Lý do từ chối:</strong></td>
                <td style="padding: 10px; color: #b91c1c; font-weight: 600;">${rejectionReason}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 25px; text-align: center; border-left: 4px solid #6b7280;">
            <p style="margin: 0; color: #4b5563; font-weight: 500;">
              Bạn có thể đặt lịch khám mới với bác sĩ khác hoặc chọn thời gian khác trên hệ thống của chúng tôi.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">Xin cảm ơn và mong bạn thông cảm!</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #757575; text-align: center;">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `;
    }

    return await sendEmail(
      recipientEmail,
      isDoctor ? "Thông báo lịch khám đã từ chối" : "❌ Lịch hẹn của bạn đã bị từ chối",
      html
    );
  } catch (error) {
    console.error("Error sending appointment rejection email:", error);
    throw error;
  }
};
const sendEmailPaymentSuccess = async (
  recipientEmail,
  paymentData,
) => {
  try {
    const patientName = paymentData.patientName || '---';
    const amount = paymentData.amount || '---'; // sửa từ "amout"
    const payment_date = paymentData.payment_date || '---';
    const transfer_content = paymentData.transfer_content || '---';

    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; font-weight: 600; margin-bottom: 5px; font-size: 24px;">Xác Nhận Thanh Toán Thành Công</h1>
          <div style="width: 50px; height: 4px; background-color: #16a34a; margin: 0 auto;"></div>
        </div>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Xin chào <span style="font-weight: 600; color: #16a34a;">${patientName}</span>,
        </p>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
          Chúng tôi đã nhận được thanh toán của bạn với thông tin như sau:
        </p>

        <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #16a34a;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Nội dung chuyển khoản:</strong></td>
              <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${transfer_content}</td>
            </tr>
            <tr>
              <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Ngày thanh toán:</strong></td>
              <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${payment_date}</td>
            </tr>
            <tr>
              <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;"><strong style="color: #555;">Số tiền:</strong></td>
              <td style="padding: 10px 5px; border-bottom: 1px solid #e0e0e0;">${amount}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Bạn có thể kiểm tra chi tiết tại mục <strong>"Lịch sử thanh toán"</strong> trên hệ thống.
        </p>

        <p style="font-size: 16px; line-height: 1.5;">Xin cảm ơn quý khách!</p>

        <div style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #757575; text-align: center;">
          <p>Đây là email tự động, vui lòng không trả lời.</p>
        </div>
      </div>
    `;

    return await sendEmail(
      recipientEmail,
      "✅ Xác nhận thanh toán thành công",
      html
    );
  } catch (error) {
    console.error("Error sending payment success email:", error);
    throw error;
  }
};
const sendEmailPrescription = async (recipientEmail, data) => {
  try {
    const {
      patientName = data.patientName,
      prescriptionUrl = data.prescriptionUrl,
      fileName = data.fileName,
      fileSize = data.fileSize,
      doctorName = data.doctorName || "Bác sĩ",
      phone_number = data.phone_number,
      clinicName = data.clinicName || "Phòng khám",
      schedule = data.schedule || new Date().toLocaleDateString('vi-VN'),
      time_start = data.time_start || "",
      time_end = data.time_end || ""
    } = data;

    // Format the consultation date and time
    const consultationDateTime = `${schedule}${time_start ? ` từ ${time_start}` : ""}${time_end ? ` đến ${time_end}` : ""}`;

    const html = `
      <div style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; max-width: 640px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header with Clinic Branding -->
        <div style="background-color: #2563eb; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${clinicName}</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Chăm sóc sức khỏe toàn diện</p>
        </div>
        
        <!-- Email Content -->
        <div style="padding: 32px;">
          <!-- Greeting -->
          <div style="margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Xin chào ${patientName},</h2>
            <p style="margin: 0; font-size: 15px; color: #4b5563;">Dưới đây là thông tin kết quả khám bệnh của bạn</p>
          </div>
          
          <!-- Prescription Card -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #2563eb;">
              <div>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Bác sĩ kê đơn</p>
                <p style="margin: 0 ; font-size: 15px; font-weight: 500; color: #1e293b;">${doctorName}</p>
              </div>
              <div >
                <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Thời gian khám</p>
                <p style="margin: 0; font-size: 15px; font-weight: 500; color: #1e293b;">${consultationDateTime}</p>
              </div>
            
            <div style="background-color: white; border-radius: 6px; padding: 16px; margin-top: 12px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 500; color: #1e293b;">Đơn thuốc của bạn</p>
             <div style="text-align: center; margin: 20px 0;">
            <a href="${prescriptionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            📥 Tải đơn thuốc (${fileName}, ${fileSize})
          </a>
            </div>
          </div>
          
          <!-- Instructions -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #111827;">Hướng dẫn sử dụng đơn thuốc</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 1.6;">
              <li>Thực hiện đúng theo chỉ dẫn của bác sĩ</li>
              <li>Uống thuốc đúng liều lượng và thời gian quy định</li>
              <li>Bảo quản thuốc theo hướng dẫn trên bao bì</li>
              <li>Tái khám đúng hẹn nếu có yêu cầu</li>
            </ul>
          </div>
          
          <!-- Contact Info -->
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">Nếu có thắc mắc về đơn thuốc, vui lòng liên hệ</p>
            <p style="margin: 0; font-size: 15px; font-weight: 500; color: #2563eb;">${clinicName} - ${phone_number}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} ${clinicName}. All rights reserved.</p>
          <p style="margin: 0;">Đây là email tự động, vui lòng không trả lời.</p>
        </div>
      </div>
    `;

    return await sendEmail(
      recipientEmail,
      `🩺 ${clinicName} - Đơn thuốc điện tử ngày ${schedule}`,
      html
    );
  } catch (error) {
    console.error('Error sending prescription email:', error);
    throw error;
  }
};
const sendVerificationEmail = async (email, otpCode) => {
  try {
    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">XÁC THỰC TÀI KHOẢN</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Xin chào,</p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP sau để hoàn tất xác thực:
          </p>
          
          <!-- OTP Code Box -->
          <div style="
            background-color: #ffffff;
            border: 2px dashed #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #1e40af;
          ">
            ${otpCode}
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 25px;">
            Mã OTP này sẽ hết hạn sau <strong>15 phút</strong>
          </p>
          
          <!-- Warning Box -->
          <div style="
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 12px;
            margin-bottom: 25px;
            border-radius: 4px;
          ">
            <p style="font-size: 14px; color: #b91c1c; margin: 0;">
              <strong>Lưu ý:</strong> Không chia sẻ mã này với bất kỳ ai.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="
          background-color: #f3f4f6;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        ">
          <p style="margin: 0;">© ${new Date().getFullYear()} Hệ thống đặt lịch khám bệnh. Đây là email tự động.</p>
        </div>
      </div>
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
  sendEmailPaymentSuccess,
  sendEmailPrescription
};
