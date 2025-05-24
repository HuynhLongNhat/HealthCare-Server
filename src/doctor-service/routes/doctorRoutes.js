import express from "express";
import doctorController from "../controllers/doctorController";
import { authenticateToken, checkRole } from "../middleware/auth";
const router = express.Router();

router.get("/specializations", doctorController.getAllSpecializations);


router.post("/specializations", doctorController.createSpecialization);

router.get("/specializations/:id", doctorController.getSpecializationById);


router.put("/specializations/:id", doctorController.updateSpecialization);


router.delete("/specializations/:id", doctorController.deleteSpecialization);

//clinic management
router.post("/clinics", doctorController.createClinic);

router.get("/clinics", doctorController.getAllClinics);
 
router.get("/clinics/:id", doctorController.getClinicById);

router.put("/clinics/:id", doctorController.updateClinic);

router.delete("/clinics/:id", doctorController.deleteClinic);


router.get("/", doctorController.getAllDoctors);

router.post("/", doctorController.createDoctor);


router.get("/:id", doctorController.getDoctorById);


router.get(
  "/specialization/:specializationId",
  doctorController.getDoctorsBySpecialization
);

router.get("/all/schedules", doctorController.getAllSchedules);


router.post(
  "/:doctorId/clinic/:clinicId/schedules",
  doctorController.createSchedule
);


router.put(
  "/:doctorId/schedules/:scheduleId",
  doctorController.updateSchedule
);


router.get(
  "/:doctorId/schedules/:scheduleId",
  doctorController.getDetailSchedule
);


router.get("/:doctorId/schedules", doctorController.getDoctorSchedules);

router.get("/:doctorId/clinic/:clinicId/schedules/:timeRange", doctorController.getDoctorSchedulesByClinic);


router.delete(
  "/:doctorId/schedules/:scheduleId",
  doctorController.deleteSchedule
);
router.delete("/:id", doctorController.deleteDoctor);

router.put("/:doctorId/profile", doctorController.updateDoctorProfile);

router.get("/specializations/:specializationId/doctors", doctorController.getAllDoctorsBySpecialization);


router.post("/ratings", doctorController.createDoctorRating);

router.get("/:doctorId/ratings", doctorController.getDoctorRatings);

router.put("/ratings/:ratingId", doctorController.updateDoctorRating);

router.delete("/ratings/:ratingId", doctorController.deleteDoctorRating);


router.get("/all/handbooks", doctorController.getAllHealthHandBook);
router.get("/all/handbooks/doctor/:doctorId", doctorController.getAllHealthHandBookByDoctorId);

router.get("/latest/handbooks", doctorController.getLatestHealthHandBooks);
router.get("/outstanding/handbooks", doctorController.getOutstandingHealthHandBooks);

router.get("/handbooks/:slug", doctorController.getHealthHandBookBySlug);
router.put("/handbooks/:slug", doctorController.updateHealthHandBook);
router.delete("/handbooks/:id", doctorController.deleteHealthHandBook);
router.post("/handbook", doctorController.createHealthHandBook);

router.post("/meetings/doctor/:doctorId", doctorController.createNewMeeting);
router.get("/meetings/doctor/:doctorId", doctorController.getAllMeetingByDoctor);
router.delete("/meetings/:meetingId", doctorController.deleteMeeting);

router.get("/clinics/search/query", doctorController.searchClinics);


export default router;
