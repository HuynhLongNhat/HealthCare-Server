import { v4 as uuidv4 } from "uuid";
import db from "../models";
import userApiService from "./userApiService";
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
            model : db.clinics,
            as : "clinics"
          }
        ],
      nest : true
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
            model : db.clinics,
            as : "clinics"
          }
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
      const specialization = await db.specializations.findByPk(specializationId);
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
  

async  getAllClinics() {
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
          as: 'clinic_images',
          attributes: ['id', 'imageUrl'],
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
 
  async getDoctorSchedulesByClinic(doctorId, clinicId) {
    try {
      const schedules = await db.schedules.findAll({
        where: {
          doctor_id: doctorId,
          clinic_id: clinicId,
        },  
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
  
      // Kiểm tra bác sĩ và cơ sở y tế có tồn tại
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
        EM: `Tạo ${createdSchedules.length} lịch thành công, bỏ qua ${skippedSchedules.length} lịch bị trùng hoặc lỗi`,
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
      console.log("vào hàm doctor schedule");
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

      // Lấy danh sách lịch hẹn của bác sĩ theo ID
      const schedules = await db.doctor_schedules.findAll({
        where: { doctor_id: doctorId },
        order: [
          ["schedule_date", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      if (!schedules || schedules.length === 0) {
        return {
          EM: "Không có lịch làm việc nào cho bác sĩ này",
          EC: 0,
          DT: {
            doctor: doctor.dataValues,
            schedules: [],
          },
        };
      }

      // Lấy thông tin user của bác sĩ
      const userInfo = await userApiService.getUserById(doctorId);

      // Chuẩn bị dữ liệu trả về
      const doctorData = {
        doctor: {
          ...doctor.dataValues,
          user: userInfo, // Thông tin user kèm theo
        },
        schedules: schedules.map((schedule) => ({
          schedule_id: schedule.schedule_id,
          schedule_date: schedule.schedule_date,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          status: schedule.status,
        })),
      };

      return {
        EM: "Lấy danh sách lịch hẹn của bác sĩ thành công",
        EC: 0,
        DT: doctorData,
      };
    } catch (error) {
      console.error("Lỗi khi lấy lịch hẹn của bác sĩ:", error);
      return {
        EM: `Error getting schedules for doctor: ${error.message}`,
        EC: -1,
        DT: [],
      };
    }
  }
  async getDetailSchedule(doctorId, scheduleId) {
    console.log("doctorId: ", doctorId);
    console.log("scheduleId: ", scheduleId);
    try {
      console.log("Fetching schedule details...");

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
          DT: null,
        };
      }
      // Lấy thông tin chi tiết của lịch hẹn
      const schedule = await db.doctor_schedules.findOne({
        where: {
          doctor_id: doctorId,
          schedule_id: scheduleId,
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
        doctor: {
          ...doctor.dataValues,
          user: userInfo || null,
        },
        schedule: {
          schedule_id: schedule.schedule_id,
          schedule_date: schedule.schedule_date,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          status: schedule.status,
        },
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
      // Nếu lịch đã BOOKED, không cho phép cập nhật thời gian
      if (
        schedule.status === "BOOKED" &&
        (updateData.schedule_date ||
          updateData.start_time ||
          updateData.end_time)
      ) {
        return {
          EM: "Lịch hẹn đã được đặt không thể cập nhật",
          EC: -4,
          DT: [],
        };
      }

      // Cập nhật lịch
      await schedule.update({
        schedule_date: updateData.schedule_date || schedule.schedule_date,
        start_time: updateData.start_time || schedule.start_time,
        end_time: updateData.end_time || schedule.end_time,
        status: updateData.status || schedule.status,
      });

      return {
        EM: "Lịch hẹn đã được cập nhật thành công!",
        EC: 0,
        DT: schedule,
      };
    } catch (error) {
      return {
        EM: `Error updating schedule: ${error.message}`,
        EC: -1,
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

  
async updateDoctorScheduleById(scheduleId, updateData) {
  try {
    const schedule = await db.schedules.findByPk(scheduleId);
    if (!schedule) {
      return {
        EM: "Không tìm thấy lịch hẹn",
        EC: -1,
        DT: [],
      };
    }

    await schedule.update(updateData);
    return {
      EM: "Cập nhật lịch hẹn thành công",
      EC: 0,
      DT: schedule,
    };
  } catch (error) {
    return {
      EM: `Lỗi hệ thống: ${error.message}`,
      EC: -1,
      DT: [],
    };
  }
}

async deleteDoctorScheduleById(scheduleId) {
  try {
    const schedule = await db.schedules.findByPk(scheduleId);
    if (!schedule) {
      return {
        EM: "Không tìm thấy lịch làm việc",
        EC: -1,
        DT: [],
      };
    }

    await schedule.destroy();
    return {
      EM: "Xóa lịch làm việc thành công",
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
  
  async createDoctorRating(data) {
    try {
      const {
        patient_id,
        doctor_id,
        professionalism_rating,
        attitude_rating,
        price_rating,
        comment
      } = data;
        const doctor = await db.doctors.findOne({ where: { user_id: doctor_id } });
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
}


export default new DoctorService();
