import db from "../models";
import userApiService from "../../utils/userApiService";
const { Op, where } = require("sequelize");
class DoctorService {
  // Doctor Management

  async createDoctor(doctorData) {
    try {
      const doctorExist = await db.doctors.findOne({
        where: { user_id: doctorData.id },
      });

      if (doctorExist) {
        return {
          EM: "Bác sĩ đã tồn tại.",
          EC: -1,
          DT: [],
        };
      }
      const res = await db.doctors.create({
        user_id: doctorData.id,
      });
      console.log("Res", res);
      return {
        EM: "Tạo mới bác sĩ thành công.",
        EC: 0,
        DT: "",
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -3,
        DT: [],
      };
    }
  }
  async getDoctorById(id) {
    try {
      // Get doctor information with specialization
      const doctor = await db.doctors.findOne({
        where: { user_id: id },
        include: [
          {
            model: db.specializations,
            as: "specialization",
            attributes: ["name", "description", "avatar"],
          },
          {
            model: db.clinics,
            as: "clinics",
          },
        ],
        nest: true,
      });

      if (!doctor) {
        return {
          EM: "Không tìm thấy bác sĩ",
          EC: -2,
          DT: [],
        };
      }
      // Fetch user info from user service
      const { userData } = await userApiService.getUserById(id);

      return {
        EM: "Lấy bác sĩ thành công.",
        EC: 0,
        DT: {
          doctor,
          userData,
        },
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }
  async getAllDoctors() {
    try {
      // Get all doctors with their specializations
      const doctors = await db.doctors.findAll({
        include: [
          {
            model: db.specializations,
            as: "specialization",
            attributes: ["name", "description", "avatar"],
          },
          {
            model: db.clinics,
            as: "clinics",
          },
        ],
      });

      const doctorDetailsPromises = doctors.map(async (doctor) => {
        try {
          const { userData } = await userApiService.getUserById(doctor.user_id);
          if (!userData) return null;
          return {
            doctor,
            userData,
          };
        } catch (error) {
          console.error(
            `Error fetching user info for doctor ${doctor.doctor_id}:`,
            error
          );
          return null;
        }
      });

      // Resolve all promises and filter out null values
      const validDoctors = (await Promise.all(doctorDetailsPromises)).filter(
        Boolean
      );

      return {
        EM: "Lấy danh sách bác sĩ thành công.",
        EC: 0,
        DT: validDoctors,
      };
    } catch (error) {
      console.error("Error getting doctors:", error);
      return {
        EM: `Error getting doctors: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  async getAllDoctorsBySpecialization(specializationId) {
    try {
      const specialization = await db.specializations.findByPk(
        specializationId
      );
      if (!specialization) {
        return {
          EM: "Không tìm thấy chuyên khoa!",
          EC: -1,
          DT: [],
        };
      }

      // Lấy danh sách bác sĩ có join clinics và specialization
      const doctors = await db.doctors.findAll({
        where: { specialization_id: specializationId },
        include: [
          {
            model: db.specializations,
            as: "specialization",
            attributes: ["name", "description", "avatar"],
          },
          {
            model: db.clinics,
            as: "clinics",
          },
        ],
        nest: true,
      });

      if (!doctors || doctors.length === 0) {
        return {
          EM: "Không có bác sĩ nào trong chuyên khoa này!",
          EC: 0,
          DT: [],
        };
      }

      // Gắn thêm thông tin user từ userApiService
      const doctorsWithUser = await Promise.all(
        doctors.map(async (doctor) => {
          const { userData } = await userApiService.getUserById(doctor.user_id);
          return {
            doctor,
            userData,
          };
        })
      );

      return {
        EM: "Lấy danh sách bác sĩ thành công!",
        EC: 0,
        DT: doctorsWithUser,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -2,
        DT: [],
      };
    }
  }

  async deleteDoctor(id) {
    try {
      const doctor = await db.doctors.findOne({
        where: { user_id: id },
      });

      if (!doctor) {
        return {
          EM: "Không tìm thấy bác sĩ",
          EC: -2,
          DT: [],
        };
      }
      await doctor.destroy();

      return {
        EM: "Xóa bác sĩ thành công",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  async updateDoctorProfile(id, updateData) {
    try {
      const doctor = await db.doctors.findOne({
        where: { user_id: id },
      });
      if (!doctor) {
        return {
          EM: "Không tìm thấy bác sĩ",
          EC: -1,
          DT: [],
        };
      }
      await doctor.update({
        user_id: id,
        specialization_id: updateData.specialty,
        position: updateData.position,
        experience: updateData.experience,
        consultation_fee: updateData.fee,
        bio: updateData.bio,
        rating: null,
      });
      return {
        EM: "Cập nhật bác sĩ thành công",
        EC: 0,
        DT: doctor,
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống : " + error.message,
        EC: -1,
        DT: doctor,
      };
    }
  }

  // Clinic Management
  async createClinic(data) {
    try {
      const clinic = await db.clinics.create({
        name: data.name,
        address: data.address,
        description: data.description,
        avatar: data.avatar,
        doctor_id: data.doctor_id,
      });

      if (clinic && data.galleryImages && data.galleryImages.length > 0) {
        const imageData = data.galleryImages.map((url) => ({
          clinicId: clinic.id,
          imageUrl: url,
        }));

        await db.clinic_images.bulkCreate(imageData);
      }

      if (!clinic) {
        return {
          EM: "Tạo mới cơ sở y tế thất bại!",
          EC: -1,
          DT: [],
        };
      }

      return {
        EM: "Tạo mới cơ sở y tế thành công!",
        EC: 0,
        DT: clinic,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -2,
        DT: [],
      };
    }
  }

  async getAllClinics() {
    try {
      const clinics = await db.clinics.findAll({
        order: [["id", "DESC"]],
      });

      if (!clinics || clinics.length === 0) {
        return {
          EM: "Lấy danh sách phòng khám thất bại!",
          EC: -1,
          DT: [],
        };
      }

      const clinicsWithDoctors = await Promise.all(
        clinics.map(async (clinic) => {
          const doctor = await this.getDoctorById(clinic.doctor_id);
          return {
            ...clinic.toJSON(),
            doctor,
          };
        })
      );

      return {
        EM: "Lấy danh sách phòng khám thành công!",
        EC: 0,
        DT: clinicsWithDoctors,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -2,
        DT: [],
      };
    }
  }

  async getClinicById(id) {
    try {
      const clinic = await db.clinics.findByPk(id, {
        include: [
          {
            model: db.clinic_images,
            as: "clinic_images",
            attributes: ["id", "imageUrl"],
          },
        ],
      });

      if (!clinic) {
        return {
          EM: "Không tìm thấy phòng khám",
          EC: 1,
          DT: null,
        };
      }
      const doctor = await this.getDoctorById(clinic.doctor_id);

      return {
        EM: "Lấy phòng khám thành công",
        EC: 0,
        DT: {
          ...clinic.toJSON(),
          doctor,
        },
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  async updateClinic(id, updateData) {
    try {
      const clinic = await db.clinics.findByPk(id);
      if (!clinic) {
        return {
          EM: "Không tìm thấy phòng khám",
          EC: -1,
          DT: [],
        };
      }

      // Cập nhật thông tin cơ bản
      await clinic.update({
        name: updateData.name,
        address: updateData.address,
        description: updateData.description,
        avatar: updateData.avatar,
        doctor_id: updateData.doctor_id,
      });

      // Nếu có galleryImages: cập nhật lại toàn bộ ảnh
      if (Array.isArray(updateData.galleryImages)) {
        // Xoá toàn bộ ảnh cũ
        await db.clinic_images.destroy({
          where: { clinicId: id },
        });

        // Thêm ảnh mới
        const imageData = updateData.galleryImages.map((url) => ({
          clinicId: id,
          imageUrl: url,
        }));

        await db.clinic_images.bulkCreate(imageData);
      }

      return {
        EM: "Cập nhật phòng khám thành công",
        EC: 0,
        DT: clinic,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -2,
        DT: [],
      };
    }
  }

  async deleteClinic(id) {
    try {
      const clinic = await db.clinics.findByPk(id);
      if (!clinic) {
        return {
          EM: "Không tìm thấy phòng khám",
          EC: -1,
          DT: [],
        };
      }
      await clinic.destroy();
      return {
        EM: "Xóa phòng khám thành công",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  // Specialization Management
  async createSpecialization(data) {
    try {
      const specialization = await db.specializations.create({
        name: data.name,
        description: data.description,
        avatar: data.avatar,
      });
      if (!specialization) {
        return {
          EM: "Tạo mới chuyên khoa thất bại!",
          EC: -1,
          DT: [],
        };
      }
      return {
        EM: "Tạo mới chuyên khoa thành công!",
        EC: 0,
        DT: specialization,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -2,
        DT: [],
      };
    }
  }

  async getAllSpecializations() {
    try {
      const listSpecializations = await db.specializations.findAll({
        order: [["createdAt", "DESC"]],
      });
      if (!listSpecializations) {
        return {
          EM: "Lấy danh sách chuyên khoa thất bại!",
          EC: -1,
          DT: [],
        };
      }
      return {
        EM: "Lấy danh sách chuyên khoa thành công!",
        EC: 0,
        DT: listSpecializations,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệt thống: ${error.message}`,
        EC: -2,
        DT: [],
      };
    }
  }

  async getSpecializationById(id) {
    try {
      if (!id) {
        return {
          EM: "Không tìm thấy id của chuyên khoa",
          EC: -1,
          DT: [],
        };
      }

      const specialization = await db.specializations.findOne({
        where: { id },
        include: [
          {
            model: db.doctors,
            as: "doctors",
          },
        ],
      });

      if (!specialization) {
        return {
          EM: "Không tìm thấy chuyên khoa",
          EC: -2,
          DT: [],
        };
      }
      const enrichedDoctors = await Promise.all(
        specialization.doctors.map(async (doc) => {
          const detail = await userApiService.getUserById(doc.user_id);
          return {
            ...doc.toJSON?.(),
            detail: detail.userData,
          };
        })
      );

      return {
        EM: "Lấy chuyên khoa thành công",
        EC: 0,
        DT: {
          ...specialization.toJSON(),
          doctors: enrichedDoctors,
        },
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống ${error.message}`,
        EC: -3,
        DT: [],
      };
    }
  }

  async updateSpecialization(id, updateData) {
    try {
      const specialization = await db.specializations.findByPk(id);
      if (!specialization) {
        return {
          EM: "Không tìm thấy chuyên khoa",
          EC: -1,
          DT: [],
        };
      }
      await specialization.update({
        name: updateData.name,
        description: updateData.description,
        avatar: updateData.avatar,
      });
      return {
        EM: "Chuyên khoa được cập nhật thành công!",
        EC: 0,
        DT: specialization,
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống : " + error.message,
        EC: -3,
        DT: "",
      };
    }
  }

  async deleteSpecialization(id) {
    try {
      const specialization = await db.specializations.findByPk(id);
      if (!specialization) {
        return {
          EM: "Không tìm thấy chuyên khoa",
          EC: -1,
          DT: [],
        };
      }
      // Kiểm tra xem có bác sĩ nào đang sử dụng chuyên khoa này không
      // const doctorsUsingSpecialization = await db.doctor_details.count({
      //   where: { specialization_id: id },
      // });

      // if (doctorsUsingSpecialization > 0) {
      //   throw new Error("Chuyên khoa này đang được sử dung không thể xóa");
      // }

      await specialization.destroy();
      return {
        EM: "Xóa chuyên khoa thành công",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      return {
        EM: "Lỗi hệ thống : " + error.message,
        EC: 0,
        DT: [],
      };
    }
  }

  async getDoctorsBySpecialization(specializationId) {
    try {
      // Kiểm tra specialization có tồn tại không
      const specialization = await db.specializations.findOne({
        where: { specialization_id: specializationId },
      });

      if (!specialization) {
        return {
          EM: "Không tìm thấy chuyên khoa",
          EC: -1,
          DT: [],
        };
      }

      // Lấy danh sách bác sĩ theo specialization_id
      const doctors = await db.doctor_details.findAll({
        where: { specialization_id: specializationId },
        include: [
          {
            model: db.specializations,
            as: "specialization",
            attributes: ["name", "description"],
          },
        ],
        raw: true,
        nest: true,
      });

      // Lấy thông tin user cho từng bác sĩ
      const doctorsWithUserInfo = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const { userData } = await userApiService.getUserById(
              doctor.doctor_id
            );
            if (!userData) {
              console.error(
                `No user data found for doctor ${doctor.doctor_id}`
              );
              return null;
            }

            const { email, user_role, user_profiles = [] } = userData || {};
            const { full_name, phone, date_of_birth, gender, address, avatar } =
              user_profiles[0] || {};

            return {
              doctor_id: doctor.doctor_id,
              user_id: doctor.user_id,
              specialization_id: doctor.specialization_id,
              position: doctor.position,
              experience_years: doctor.experience_years,
              consultation_fee: doctor.consultation_fee,
              specialization: doctor.specialization,
              // Thông tin user
              email: email || "",
              full_name: full_name || "",
              phone: phone || "",
              user_role: user_role || "",
              date_of_birth: date_of_birth || "",
              gender: gender || "",
              address: address || "",
              avatar: avatar || "",
            };
          } catch (error) {
            console.error(
              `Error fetching user info for doctor ${doctor.doctor_id}:`,
              error
            );
            return null;
          }
        })
      );

      // Lọc bỏ các bác sĩ không lấy được thông tin user
      const validDoctors = doctorsWithUserInfo.filter(
        (doctor) => doctor !== null
      );

      return {
        EM: "Lấy danh sách bác sĩ theo chuyên khoa thành công",
        EC: 0,
        DT: {
          specialization: {
            id: specialization.specialization_id,
            name: specialization.name,
            description: specialization.description,
          },
          doctors: validDoctors,
        },
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  // Schedule Management
  async getAllSchedules() {
    try {
      const schedules = await db.doctor_schedules.findAll({
        include: [
          {
            model: db.doctor_details,
            as: "doctor",
            attributes: { exclude: ["specialization_id"] },
            include: [
              {
                model: db.specializations,
                as: "specialization",
                attributes: ["name", "description"],
              },
            ],
          },
        ],
        order: [
          ["schedule_date", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      if (!schedules || schedules.length === 0) {
        return {
          EM: "Không có lịch hẹn nào",
          EC: -1,
          DT: [],
        };
      }

      // Format dữ liệu
      const formattedSchedules = await Promise.all(
        schedules.map(async (schedule) => {
          try {
            // Lấy thông tin user từ API cho bác sĩ tương ứng
            const userInfo = await userApiService.getUserById(
              schedule.doctor.doctor_id
            );

            return {
              schedule_id: schedule.schedule_id,
              schedule_date: schedule.schedule_date,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              status: schedule.status,
              doctor: {
                doctor_id: schedule.doctor.doctor_id,
                position: schedule.doctor.position,
                specialization: schedule.doctor.specialization.name,
                user: userInfo, // Thông tin user của bác sĩ
              },
            };
          } catch (error) {
            console.error(
              `Lỗi khi xử lý lịch hẹn với ID ${schedule.schedule_id}:`,
              error
            );
            return null; // Bỏ qua nếu có lỗi
          }
        })
      );

      // Lọc bỏ các lịch hẹn không hợp lệ (nếu có lỗi trong Promise)
      const validSchedules = formattedSchedules.filter((item) => item !== null);

      return {
        EM: "Lấy danh sách lịch hẹn thành công",
        EC: 0,
        DT: validSchedules,
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
      return {
        EM: `Error getting schedules: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

async getDoctorSchedulesByClinic(doctorId, clinicId, timeRange) {
  try {
    const whereCondition = {
      doctor_id: doctorId,
      clinic_id: clinicId,
    };
    if (timeRange) {
      switch (timeRange) {
        case 'all':
          break;
        case 'today':
          // Lấy ngày hôm nay
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          whereCondition.date = {
            [db.Sequelize.Op.gte]: today
          };
          break;
        case 'fromToday':
          // Lấy từ ngày hôm nay trở đi
          const fromToday = new Date();
          fromToday.setHours(0, 0, 0, 0);
          whereCondition.date = {
            [db.Sequelize.Op.gte]: fromToday
          };
          break;
        case 'dateRange':
          // Lấy trong khoảng từ ngày đến ngày
          if (startDate && endDate) {
            const startDate = new Date(startDate);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(endDate);
            endDate.setHours(23, 59, 59, 999);
            
            whereCondition.date = {
              [db.Sequelize.Op.between]: [startDate, endDate]
            };
          }
          break;
        default:
          break;
      }
    }

    const schedules = await db.schedules.findAll({
      where: whereCondition,
      order: [
        ["date", "ASC"],
        ["time_start", "ASC"],
      ],
    });

    if (!schedules || schedules.length === 0) {
      return {
        EM: "Không có lịch làm việc nào cho bác sĩ tại phòng khám này",
        EC: 0,
        DT: [],
      };
    }

    return {
      EM: "Lấy danh sách lịch làm việc thành công",
      EC: 0,
      DT: schedules,
    };
  } catch (error) {
    return {
      EM: `Lỗi hệ thống: ${error.message}`,
      EC: -1,
      DT: [],
    };
  }
}

async createSchedule(doctorId, clinicId, scheduleData) {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
      return {
        EM: "Danh sách lịch hẹn không hợp lệ",
        EC: -3,
        DT: [],
      };
    }

    const [doctor, clinic] = await Promise.all([
      db.doctors.findOne({ where: { user_id: doctorId } }),
      db.clinics.findOne({ where: { id: clinicId } }),
    ]);

    if (!doctor) {
      return { EM: "Không tìm thấy bác sĩ", EC: -1, DT: [] };
    }

    if (!clinic) {
      return { EM: "Không tìm thấy cơ sở y tế", EC: -2, DT: [] };
    }

    const createdSchedules = [];
    const skippedSchedules = [];

    for (const item of scheduleData) {
      const { date, startTime, endTime } = item;

      if (!date || !startTime || !endTime) {
        skippedSchedules.push({ ...item, reason: "Thiếu thông tin" });
        continue;
      }

      // Tạo đối tượng Date để so sánh với thời gian hiện tại
      const scheduleDateTime = new Date(`${date}T${startTime}`);
      const now = new Date();

      if (scheduleDateTime < now) {
        skippedSchedules.push({ ...item, reason: "Lịch đã qua thời điểm hiện tại" });
        continue;
      }

      const isExist = await db.schedules.findOne({
        where: {
          doctor_id: doctorId,
          clinic_id: clinicId,
          date: date,
          time_start: startTime,
          time_end: endTime,
        },
      });

      if (isExist) {
        skippedSchedules.push({ ...item, reason: "Trùng lịch" });
        continue;
      }

      const newSchedule = await db.schedules.create({
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: date,
        time_start: startTime,
        time_end: endTime,
        status: "AVAILABLE",
      });

      createdSchedules.push(newSchedule);
    }

    return {
      EM: `Tạo ${createdSchedules.length} lịch thành công, bỏ qua ${skippedSchedules.length} lịch bị trùng, lỗi hoặc đã qua thời gian`,
      EC: 0,
      DT: {
        created: createdSchedules,
        skipped: skippedSchedules,
      },
    };
  } catch (error) {
    return {
      EM: `Lỗi hệ thống: ${error.message}`,
      EC: -99,
      DT: [],
    };
  }
}

async getDoctorSchedules(doctorId) {
    try {
      // Kiểm tra bác sĩ tồn tại và lấy thông tin bác sĩ cùng chuyên môn
      const doctor = await db.doctor_details.findOne({
        where: { doctor_id: doctorId },
        attributes: { exclude: ["specialization_id"] },
        include: [
          {
            model: db.specializations,
            as: "specialization",
            attributes: ["name", "description"],
          },
        ],
      });

      if (!doctor) {
        return {
          EM: "Không tìm thấy bác sĩ",
          EC: -1,
          DT: [],
        };
      }

      // Lấy ngày hôm nay (định dạng YYYY-MM-DD)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];
      console.log("Hôm nay là:", todayString);

      // Lấy danh sách lịch hẹn của bác sĩ trong ngày hôm nay
      const schedules = await db.doctor_schedules.findAll({
        where: { 
          doctor_id: doctorId,
          date: todayString // Sửa từ schedule_date thành date
        },
        order: [
          ["time_start", "ASC"], // Sửa từ start_time thành time_start
        ],
      });

      // Lấy thông tin user của bác sĩ
      const userInfo = await userApiService.getUserById(doctorId);

      // Chuẩn bị dữ liệu trả về
      const doctorData = {
        doctor: {
          ...doctor.dataValues,
          user: userInfo,
        },
        schedules: schedules.map((schedule) => ({
          id: schedule.id, // Thêm trường id nếu cần
          schedule_id: schedule.id, // Hoặc có thể dùng schedule.id thay cho schedule_id
          date: schedule.date, // Sửa từ schedule_date thành date
          time_start: schedule.time_start, // Sửa từ start_time thành time_start
          time_end: schedule.time_end, // Sửa từ end_time thành time_end
          status: schedule.status,
          clinic_id: schedule.clinic_id // Thêm thông tin clinic_id nếu cần
        })),
      };

      return {
        EM: schedules.length > 0 
          ? "Lấy danh sách lịch hẹn của bác sĩ hôm nay thành công" 
          : "Bác sĩ không có lịch làm việc hôm nay",
        EC: 0,
        DT: doctorData,
      };
    } catch (error) {
      console.error("Lỗi khi lấy lịch hẹn của bác sĩ:", error);
      return {
        EM: `Lỗi khi lấy lịch hẹn của bác sĩ: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
}
  async getDetailSchedule(doctorId, scheduleId) {
    try {
      // Kiểm tra bác sĩ tồn tại và lấy thông tin bác sĩ cùng chuyên môn
      const doctor = await db.doctors.findOne({
        where: { user_id: doctorId },
        attributes: { exclude: ["specialization_id"] },
        include: [
          {
            model: db.specializations,
            as: "specialization",
            attributes: ["name", "description"],
          },
        ],
      });

      if (!doctor) {
        return {
          EM: "Không tìm thấy bác sĩ",
          EC: -1,
          DT: null,
        };
      }
      // Lấy thông tin chi tiết của lịch hẹn
      const schedule = await db.schedules.findOne({
        where: {
          doctor_id: doctorId,
          id: scheduleId,
        },
      });

      if (!schedule) {
        return {
          EM: "Không tìm thấy lịch hẹn chi tiết",
          EC: -1,
          DT: null,
        };
      }

      // Lấy thông tin user của bác sĩ
      const userInfo = await userApiService.getUserById(doctorId);

      // Chuẩn bị dữ liệu trả về
      const scheduleDetails = {
        doctor,
        userInfo,
        schedule
      };

      return {
        EM: "Lấy chi tiết lịch hẹn thành công",
        EC: 0,
        DT: scheduleDetails,
      };
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      return {
        EM: `Đã xảy ra lỗi khi lấy chi tiết lịch hẹn: ${error.message}`,
        EC: -1,
        DT: null,
      };
    }
  }

  async updateSchedule(doctorId, scheduleId, updateData) {
    console.log("bác sĩ đã cập nhật lịch hẹn")
    try {
      const schedule = await db.schedules.findOne({
        where: {
          id: scheduleId,
          doctor_id: doctorId,
        },
      });

      if (!schedule) {
        return {
          EM: "Lịch hẹn không tồn tại",
          EC: -1,
          DT: [],
        };
      }

      // Prevent updating time for BOOKED schedules
      if (
        schedule.status === "BOOKED" &&
        (updateData.date || updateData.time_start || updateData.time_end)
      ) {
        return {
          EM: "Lịch hẹn đã được đặt không thể cập nhật !",
          EC: -2,
          DT: [],
        };
      }

      // Check for time conflicts with the same doctor's other schedules
      if (updateData.date || updateData.time_start || updateData.time_end) {
        const newDate = updateData.date || schedule.date;
        const newStartTime = updateData.time_start || schedule.time_start;
        const newEndTime = updateData.time_end || schedule.time_end;

        // Convert times to minutes for easier comparison
        const toMinutes = (timeStr) => {
          const [hours, minutes] = timeStr.split(":").map(Number);
          return hours * 60 + minutes;
        };

        const newStart = toMinutes(newStartTime);
        const newEnd = toMinutes(newEndTime);

        // Find all schedules for this doctor on the same day (excluding current schedule)
        const sameDaySchedules = await db.schedules.findAll({
          where: {
            doctor_id: doctorId,
            date: newDate,
            id: { [db.Sequelize.Op.ne]: scheduleId },
          },
        });

        // Check for overlapping time slots
        const hasConflict = sameDaySchedules.some((existingSchedule) => {
          const existingStart = toMinutes(existingSchedule.time_start);
          const existingEnd = toMinutes(existingSchedule.time_end);

          return (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          );
        });

        if (hasConflict) {
          return {
            EM: "Bác sĩ đã có lịch khám trong khoảng thời gian này",
            EC: -3,
            DT: [],
          };
        }
      }

      // Update the schedule
      const updatedSchedule = await schedule.update({
        date: updateData.date || schedule.date,
        time_start: updateData.time_start || schedule.time_start,
        time_end: updateData.time_end || schedule.time_end,
        status: updateData.status || schedule.status,
      });

      return {
        EM: "Cập nhật lịch hẹn thành công!",
        EC: 0,
        DT: updatedSchedule,
      };
    } catch (error) {
      console.error("Error updating schedule:", error);
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -4,
        DT: [],
      };
    }
  }
  async deleteSchedule(doctorId, scheduleId) {
    try {
      const schedule = await db.doctor_schedules.findOne({
        where: {
          schedule_id: scheduleId,
          doctor_id: doctorId,
        },
      });

      if (!schedule) {
        return {
          EM: "Lịch hẹn không tồn tại",
          EC: -1,
          DT: [],
        };
      }
      // Không cho phép xóa lịch đã BOOKED
      if (schedule.status === "BOOKED") {
        return {
          EM: "Không thể xóa lịch đã đặt.",
          EC: -4,
          DT: [],
        };
      }

      await schedule.destroy();

      return {
        EM: "Lịch hẹn đã được xóa thành công.",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      return {
        EM: `Error deleting schedule: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }



  async createDoctorRating(data) {
    try {
      const {
        patient_id,
        doctor_id,
        professionalism_rating,
        attitude_rating,
        price_rating,
        comment,
      } = data;
      const doctor = await db.doctors.findOne({
        where: { user_id: doctor_id },
      });
      if (!doctor) {
        return { EM: "Không tìm thấy bác sĩ", EC: -1, DT: [] };
      }
      const newRating = await db.doctor_rating.create({
        doctor_id,
        patient_id,
        professionalism_rating,
        attitude_rating,
        price_rating,
        comment,
      });

      return {
        EM: "Tạo đánh giá thành công",
        EC: 0,
        DT: newRating,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  async getDoctorRatings(doctorId) {
    try {
      const ratings = await db.doctor_rating.findAll({
        where: { doctor_id: doctorId },
        order: [["createdAt", "DESC"]],
      });
      const ratingsWithPatientInfo = [];
      for (let rating of ratings) {
        const patientInfo = await userApiService.getUserById(rating.patient_id);
        ratingsWithPatientInfo.push({
          rating,
          userData: patientInfo.userData,
        });
      }
      return {
        EM: "Lấy danh sách đánh giá thành công",
        EC: 0,
        DT: ratingsWithPatientInfo,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  async updateDoctorRating(ratingId, updateData) {
    try {
      const rating = await db.doctor_rating.findByPk(ratingId);
      if (!rating) {
        return { EM: "Không tìm thấy đánh giá", EC: -1, DT: [] };
      }

      await rating.update(updateData);

      return {
        EM: "Cập nhật đánh giá thành công",
        EC: 0,
        DT: rating,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  async deleteDoctorRating(ratingId) {
    try {
      const rating = await db.doctor_rating.findByPk(ratingId);
      if (!rating) {
        return { EM: "Không tìm thấy đánh giá", EC: -1, DT: [] };
      }

      await rating.destroy();

      return {
        EM: "Xóa đánh giá thành công",
        EC: 0,
        DT: [],
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }
  async getAllHealthHandBook() {
    try {
      const handbooks = await db.health_handbook.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
        nest: true,
      });
      const handbookWithDoctors = await Promise.all(
        handbooks.map(async (handbook) => {
          const doctor = await this.getDoctorById(handbook.author_id);
          return {
            handbook,
            doctor,
          };
        })
      );
      return {
        EM: "Lấy danh sách cẩm nang thành công",
        EC: 0,
        DT: handbookWithDoctors,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }
  async getAllHealthHandBookByDoctorId(doctorId) {
    try {
      const handbooks = await db.health_handbook.findAll({
        where: { author_id: doctorId },
        order: [["createdAt", "DESC"]],
        raw: true,
      });
      const { userData } = await userApiService.getUserById(doctorId);
      const result = handbooks.map((handbook) => ({
        handbook,
        userData,
      }));
      return {
        EM: "Lấy danh sách cẩm nang theo bác sĩ thành công",
        EC: 0,
        DT: result,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }
  async getHealthHandBookBySlug(slug) {
    try {
      // Tìm handbook trước
      const handbook = await db.health_handbook.findOne({
        where: { slug: slug },
        raw: true,
        nest: true,
      });

      if (!handbook) {
        return {
          EM: "Không tìm thấy cẩm nang",
          EC: -1,
          DT: [],
        };
      }

      // Tăng view_count bằng cách update trực tiếp
      await db.health_handbook.update(
        { view_count: db.sequelize.literal("view_count + 1") },
        { where: { slug: slug } }
      );

      // Lấy thông tin user
      const { userData } = await userApiService.getUserById(handbook.author_id);

      // Tạo kết quả trả về (cần lấy lại handbook để có view_count mới nhất)
      const updatedHandbook = await db.health_handbook.findOne({
        where: { slug: slug },
        raw: true,
        nest: true,
      });

      const result = {
        ...updatedHandbook,
        userData,
      };

      return {
        EM: "Lấy chi tiết cẩm nang thành công",
        EC: 0,
        DT: result,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }
  async getLatestHealthHandBooks(limit = 20) {
    try {
      const handbooks = await db.health_handbook.findAll({
        order: [["createdAt", "DESC"]],
        limit,
        raw: true,
        nest: true,
      });
      const handbookWithDoctors = await Promise.all(
        handbooks.map(async (handbook) => {
          const doctor = await this.getDoctorById(handbook.author_id);
          return {
            handbook,
            doctor,
          };
        })
      );
      return {
        EM: "Lấy cẩm nang mới nhất thành công",
        EC: 0,
        DT: handbookWithDoctors,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }

  async getOutstandingHealthHandBooks(limit = 4) {
    try {
      const handbooks = await db.health_handbook.findAll({
        order: [["view_count", "DESC"]],
        limit,
        raw: true,
        nest: true,
      });
      const handbookWithDoctors = await Promise.all(
        handbooks.map(async (handbook) => {
          const doctor = await this.getDoctorById(handbook.author_id);
          return {
            handbook,
            doctor,
          };
        })
      );
      return {
        EM: "Lấy cẩm nang mới nhất thành công",
        EC: 0,
        DT: handbookWithDoctors,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }
  async updateHealthHandBook(slug, updateData) {
    try {
      const handbook = await db.health_handbook.findOne({
        where: { slug: slug },
      });
      if (!handbook) {
        return {
          EM: "Không tìm thấy cẩm nang",
          EC: -1,
          DT: null,
        };
      }
      await handbook.update(updateData);
      return {
        EM: "Cập nhật bài viết thành công",
        EC: 0,
        DT: handbook,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: null,
      };
    }
  }

  // Xóa handbook
  async deleteHealthHandBook(id) {
    try {
      const handbook = await db.health_handbook.findOne({
        where: { id: id },
      });
      if (!handbook) {
        return {
          EM: "Không tìm thấy bài viết",
          EC: -1,
          DT: null,
        };
      }
      await handbook.destroy();
      return {
        EM: "Xóa bài viết thành công",
        EC: 0,
        DT: null,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: null,
      };
    }
  }
  async createHealthHandBook(data) {
    const { title, slug, content, avatar, author_id } = data;
    try {
      const newHandbook = await db.health_handbook.create({
        title,
        slug,
        content,
        avatar,
        author_id,
      });
      return {
        EM: "Tạo cẩm nang thành công",
        EC: 0,
        DT: newHandbook,
      };
    } catch (error) {
      return {
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: null,
      };
    }
  }

  async createNewMeeting(doctorId , data) {
    try {
      const meeting = await db.meetings.create({
        doctor_id: doctorId,
        room_name: data.roomName,
        meeting_url: data.meetingUrl,
        date: data.date,
        duration : data.duration
      });
      return { EM: "Tạo meeting thành công", EC: 0, DT: meeting };
    } catch (error) {
      return { EM: `Lỗi hệ thống: ${error.message}`, EC: -1, DT: null };
    }
  }

  async getAllMeetingByDoctor(doctorId) {
    try {
      const meetings = await db.meetings.findAll({
        where: { doctor_id: doctorId },
        order: [["date", "DESC"]],
      });
      return { EM: "Lấy danh sách meeting thành công", EC: 0, DT: meetings };
    } catch (error) {
      return { EM: `Lỗi hệ thống: ${error.message}`, EC: -1, DT: [] };
    }
  }

  async deleteMeeting(meetingId) {
    try {
      const meeting = await db.meetings.findOne({
        where : {id : meetingId}
      });
      if (!meeting) {
        return { EM: "Không tìm thấy meeting", EC: -1, DT: null };
      }
      await meeting.destroy();
      return { EM: "Xóa meeting thành công", EC: 0, DT: null };
    } catch (error) {
      return { EM: `Lỗi hệ thống: ${error.message}`, EC: -1, DT: null };
    }
  }
  async searchClinics(query) {
    try {
    const { name, address, doctor_id } = query;

    if (name) {
      where.name = { [db.Sequelize.Op.like]: `%${name}%` };
    }
    if (address) {
      where.address = { [db.Sequelize.Op.like]: `%${address}%` };
    }
    if (doctor_id) {
      where.doctor_id = doctor_id;
    }

    const clinics = await db.clinics.findAll({
      order: [["id", "DESC"]],
       limit: 5
    });

    return {
      EM: "Tìm kiếm phòng khám thành công!",
      EC: 0,
      DT: clinics,
    };
  } catch (error) {
    return {
      EM: `Lỗi hệ thống: ${error.message}`,
      EC: -2,
      DT: [],
    };
  }
}
}

export default new DoctorService();
