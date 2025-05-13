import doctorService from "../services/doctorService";

class DoctorController {
  // Doctor Management
  async createDoctor(req, res) {
    try {
      const result = await doctorService.createDoctor(req.body);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async getAllDoctors(req, res) {
    try {
      const result = await doctorService.getAllDoctors();
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }
  async getAllDoctorsBySpecialization(req, res) {
    try {
      const { specializationId } = req.params;
      const result = await doctorService.getAllDoctorsBySpecialization(
        specializationId
      );

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }
  async getDoctorById(req, res) {
    try {
      const result = await doctorService.getDoctorById(req.params.id);

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async deleteDoctor(req, res) {
    try {
      const result = await doctorService.deleteDoctor(req.params.id);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async updateDoctorProfile(req, res) {
    try {
      const result = await doctorService.updateDoctorProfile(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  //Clinisc Specialization
  async createClinic(req, res) {
    try {
      const result = await doctorService.createClinic(req.body);
      return res.status(201).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }
  async getAllClinics(req, res) {
    try {
      const result = await doctorService.getAllClinics();
      return res.status(201).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async getClinicById(req, res) {
    try {
      const result = await doctorService.getClinicById(req.params.id);
      return res.status(201).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }
  async updateClinic(req, res) {
    try {
      const result = await doctorService.updateClinic(req.params.id, req.body);
      return res.status(201).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }
  async deleteClinic(req, res) {
    try {
      const result = await doctorService.deleteClinic(req.params.id);
      return res.status(201).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }
  // Specialization Management
  async createSpecialization(req, res) {
    try {
      const result = await doctorService.createSpecialization(req.body);
      return res.status(201).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async getAllSpecializations(req, res) {
    try {
      const result = await doctorService.getAllSpecializations();
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async getSpecializationById(req, res) {
    try {
      const result = await doctorService.getSpecializationById(req.params.id);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async updateSpecialization(req, res) {
    try {
      const result = await doctorService.updateSpecialization(
        req.params.id,
        req.body
      );
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async deleteSpecialization(req, res) {
    try {
      const result = await doctorService.deleteSpecialization(req.params.id);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(400).json({
        EM: error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async getDoctorsBySpecialization(req, res) {
    try {
      const { specializationId } = req.params;
      const result = await doctorService.getDoctorsBySpecialization(
        specializationId
      );

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống : " + error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  // Schedule Management
  async getAllSchedules(req, res) {
    try {
      const result = await doctorService.getAllSchedules();
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống : " + error.message,
        EC: -1,
        DT: [],
      });
    }
  }
  async getDoctorSchedulesByClinic(req, res) {
    try {
      const { doctorId, clinicId } = req.params;
      const result = await doctorService.getDoctorSchedulesByClinic(
        doctorId,
        clinicId
      );

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }
  async createSchedule(req, res) {
    try {
      const { doctorId } = req.params;
      const { clinicId } = req.params;
      const scheduleData = req.body;

      const result = await doctorService.createSchedule(
        doctorId,
        clinicId,
        scheduleData
      );
      return res.status(201).json({
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
  }

  async getDoctorSchedules(req, res) {
    try {
      const { doctorId } = req.params;
      const result = await doctorService.getDoctorSchedules(doctorId);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Error getting schedules",
        EC: -1,
        DT: [],
      });
    }
  }

  async getDetailSchedule(req, res) {
    try {
      const { doctorId, scheduleId } = req.params;
      const updateData = req.body;

      const result = await doctorService.getDetailSchedule(
        doctorId,
        scheduleId,
        updateData
      );
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống :" + error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async updateSchedule(req, res) {
    try {
      const { doctorId, scheduleId } = req.params;
      const updateData = req.body;

      const result = await doctorService.updateSchedule(
        doctorId,
        scheduleId,
        updateData
      );
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Lỗi hệ thống :" + error.message,
        EC: -1,
        DT: [],
      });
    }
  }

  async deleteSchedule(req, res) {
    try {
      const { doctorId, scheduleId } = req.params;

      const result = await doctorService.deleteSchedule(doctorId, scheduleId);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Error deleting schedule",
        EC: -1,
        DT: [],
      });
    }
  }

  async updateDoctorScheduleById(req, res) {
    try {
      const { scheduleId } = req.params;
      const updateData = req.body;

      const result = await doctorService.updateDoctorScheduleById(
        scheduleId,
        updateData
      );

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }

  async deleteDoctorScheduleById(req, res) {
    try {
      const { scheduleId } = req.params;

      const result = await doctorService.deleteDoctorScheduleById(scheduleId);

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }
  async createDoctorRating(req, res) {
    try {
      const result = await doctorService.createDoctorRating(req.body);
      return res.status(201).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }

  async getDoctorRatings(req, res) {
    try {
      const { doctorId } = req.params;
      const result = await doctorService.getDoctorRatings(doctorId);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }

  async updateDoctorRating(req, res) {
    try {
      const { ratingId } = req.params;
      const result = await doctorService.updateDoctorRating(ratingId, req.body);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }

  async deleteDoctorRating(req, res) {
    try {
      const { ratingId } = req.params;
      const result = await doctorService.deleteDoctorRating(ratingId);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }
  async getAllHealthHandBook(req, res) {
    const result = await doctorService.getAllHealthHandBook();
    return res.status(200).json(result);
  }

  async getAllHealthHandBookByDoctorId(req, res) {
    const { doctorId } = req.params;
    const result = await doctorService.getAllHealthHandBookByDoctorId(doctorId);
    return res.status(200).json(result);
  }

  async getHealthHandBookBySlug(req, res) {
    const { slug } = req.params;
    const result = await doctorService.getHealthHandBookBySlug(slug);
    return res.status(200).json(result);
  }
 
  async updateHealthHandBook(req, res) {
    const { id } = req.params;
    const result = await doctorService.updateHealthHandBook(id, req.body);
    return res.status(200).json(result);
  }

  async deleteHealthHandBook(req, res) {
    const { id } = req.params;
    try {
      const result = await doctorService.deleteHealthHandBook(id);

      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }
  async createHealthHandBook(req, res) {
    try {
      const result = await doctorService.createHealthHandBook(req.body);
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
  }
  async getLatestHealthHandBooks(req, res) {
  try {
     const result = await doctorService.getLatestHealthHandBooks();
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }
    
  }

    async getOutstandingHealthHandBooks(req, res) {
  try {
     const result = await doctorService.getOutstandingHealthHandBooks();
      return res.status(200).json({
        EM: result.EM,
        EC: result.EC,
        DT: result.DT,
      });
    } catch (error) {
      return res.status(500).json({
        EM: `Lỗi hệ thống: ${error.message}`,
        EC: -1,
        DT: [],
      });
    }

    
  }
  
}

export default new DoctorController();
