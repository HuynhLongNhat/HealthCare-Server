import express from "express";
import doctorController from "../controllers/doctorController";
import { authenticateToken, checkRole } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Specialization:
 *       type: object
 *       properties:
 *         specialization_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     Doctor:
 *       type: object
 *       properties:
 *         doctor_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         position:
 *           type: string
 *         experience_years:
 *           type: number
 *         consultation_fee:
 *           type: number
 *         specialization_id:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /api/doctors/specializations:
 *   get:
 *     summary: Get all specializations
 *     tags: [Specializations]
 *     responses:
 *       200:
 *         description: List of all specializations
 */
router.get("/specializations", doctorController.getAllSpecializations);

/**
 * @swagger
 * /api/doctors/specializations:
 *   post:
 *     summary: Create a new specialization
 *     tags: [Specializations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the specialization
 *               description:
 *                 type: string
 *                 description: Description of the specialization
 *               avatar:
 *                 type: string
 *                 description: avatar of the specialization
 *     responses:
 *       201:
 *         description: Specialization created successfully
 */
router.post("/specializations", doctorController.createSpecialization);

/**
 * @swagger
 * /api/doctors/specializations/{id}:
 *   get:
 *     summary: Get specialization details
 *     tags: [Specializations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialization ID
 *     responses:
 *       200:
 *         description: Success
 *     
 *       404:
 *         description: Specialization not found

 *       400:
 *         description: Bad request
 
 */
router.get("/specializations/:id", doctorController.getSpecializationById);

/**
 * @swagger
 * /api/doctors/specializations/{id}:
 *   put:
 *     summary: Update a specialization
 *     tags: [Specializations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: id of the specialization to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the specialization
 *                 example: "Khoa Nội"
 *               description:
 *                 type: string
 *                 description: New description of the specialization
 *                 example: "Chẩn đoán và điều trị các bệnh nội khoa"
 *     responses:
 *       200:
 *         description: Specialization updated successfully
 
 *       400:
 *         description: Invalid input
 
 *       404:
 *         description: Specialization not found

 */
router.put("/specializations/:id", doctorController.updateSpecialization);

/**
 * @swagger
 * /api/doctors/specializations/{id}:
 *   delete:
 *     summary: Delete a specialization
 *     tags: [Specializations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: id of the specialization to delete
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Specialization deleted successfully
 
 *       400:
 *         description: Cannot delete specialization in use

 *       404:
 *         description: Specialization not found
 
 */
router.delete("/specializations/:id", doctorController.deleteSpecialization);

//clinic management
router.post("/clinics", doctorController.createClinic);

router.get("/clinics", doctorController.getAllClinics);
 
router.get("/clinics/:id", doctorController.getClinicById);

router.put("/clinics/:id", doctorController.updateClinic);

router.delete("/clinics/:id", doctorController.deleteClinic);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors (Patient, Doctor, Admin)
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of all doctors
 *       401:
 *         description: Unauthorized
 *
 */
router.get("/", doctorController.getAllDoctors);
/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Add doctor details for existing user (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - specialization_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of existing user with DOCTOR role
 *               specialization_id:
 *                 type: string
 *                 description: ID of the specialization
 *               position:
 *                 type: string
 *                 enum: [NONE, MASTER, DOCTOR, ASSOCIATE PROFESSOR, PROFESSOR]
 *                 default: NONE
 *               experience_years:
 *                 type: integer
 *                 default: 0
 *               consultation_fee:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Doctor details added successfully
 *       400:
 *         description: Invalid input or user not found
 *       409:
 *         description: Doctor details already exists for this user
 */
router.post("/", doctorController.createDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor details (Patient, Doctor , Admin )
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor details retrieved successfully
 */
router.get("/:id", doctorController.getDoctorById);

/**
 * @swagger
 * /api/doctors/{id}/profile:
 *   put:
 *     summary: Update doctor's own profile (Doctor only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               experience_years:
 *                 type: number
 *               consultation_fee:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/:id/profile", doctorController.updateDoctorProfile);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete doctor (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 */
router.delete("/:id", doctorController.deleteDoctor);

/**
 * @swagger
 * /api/doctors/specialization/{specializationId}:
 *   get:
 *     summary: Get all doctors by specialization
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: specializationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of doctors in the specialization
 *       404:
 *         description: Specialization not found
 */
router.get(
  "/specialization/:specializationId",
  doctorController.getDoctorsBySpecialization
);

// Schedule Management Routes
/**
 * @swagger
 * /api/doctors/all/schedules:
 *   get:
 *     summary: Get all doctor schedules (Patient, Doctor , Admin )
 *     tags: [Schedules]

 *     responses:
 *       200:
 *         description: List of all schedules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         schedule_id:
 *           type: string
 *         schedule_date:
 *           type: string
 *           format: date
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 *         status:
 *           type: string
 *           enum: [AVAILABLE, BOOKED]
 */
router.get("/all/schedules", doctorController.getAllSchedules);

/**
 * @swagger
 * /api/doctors/{doctorId}/schedules:
 *   post:
 *     summary: Create schedule (ADMIN for any doctor, DOCTOR for self only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedule_date
 *               - start_time
 *               - end_time
 *             properties:
 *               schedule_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-05"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "07:00:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   example: Schedule created successfully
 *                 EC:
 *                   type: number
 *                   example: 0
 *                 DT:
 *                   type: object
 *       400:
 *         description: Invalid input or duplicate schedule
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Invalid role or not own schedule
 */
router.post(
  "/:doctorId/clinic/:clinicId/schedules",
  doctorController.createSchedule
);

/**
 * @swagger
 * /api/doctors/{doctorId}/schedules/{scheduleId}:
 *   put:
 *     summary: Update schedule (ADMIN for any doctor, DOCTOR for self only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the doctor
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the schedule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-05"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "07:00:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, BOOKED]
 *                 example: "AVAILABLE"
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   example: Schedule updated successfully
 *                 EC:
 *                   type: number
 *                   example: 0
 *                 DT:
 *                   type: object
 *       400:
 *         description: Invalid input or schedule not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Invalid role or not own schedule
 */
router.put(
  "/:doctorId/schedules/:scheduleId",
  doctorController.updateSchedule
);

/**
 * @swagger
 * /api/doctors/{doctorId}/schedules/{scheduleId}:
 *   get:
 *     summary: Get details of a specific schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the doctor
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the schedule
 *     responses:
 *       200:
 *         description: Successfully retrieved schedule details
 *       400:
 *         description: Schedule not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Invalid role or not own schedule
 */
router.get(
  "/:doctorId/schedules/:scheduleId",
  doctorController.getDetailSchedule
);

/**
 * @swagger
 * /api/doctors/{doctorId}/schedules:
 *   get:
 *     summary: Get doctor's schedules (Patient, Doctor , Admin)
 *     tags: [Schedules]

 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the doctor
 *     responses:
 *       200:
 *         description: Doctor's schedules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Invalid role or not own schedule
 */
router.get("/:doctorId/schedules", doctorController.getDoctorSchedules);

router.get("/:doctorId/clinic/:clinicId/schedules", doctorController.getDoctorSchedulesByClinic);

/**
 * @swagger
 * /api/doctors/{doctorId}/schedules/{scheduleId}:
 *   delete:
 *     summary: Delete schedule (ADMIN for any doctor, DOCTOR for self only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the doctor
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the schedule
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   example: Schedule deleted successfully
 *                 EC:
 *                   type: number
 *                   example: 0
 *                 DT:
 *                   type: array
 *                   example: []
 *       400:
 *         description: Schedule not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Invalid role or not own schedule
 */
router.delete(
  "/:doctorId/schedules/:scheduleId",
  doctorController.deleteSchedule
);

router.put("/schedules/:scheduleId", doctorController.updateDoctorScheduleById);

// Xóa lịch hẹn theo ID
router.delete("/schedules/:scheduleId", doctorController.deleteDoctorScheduleById);

router.get("/specializations/:specializationId/doctors", doctorController.getAllDoctorsBySpecialization);


router.post("/ratings", doctorController.createDoctorRating);

router.get("/:doctorId/ratings", doctorController.getDoctorRatings);

router.put("/ratings/:ratingId", doctorController.updateDoctorRating);

router.delete("/ratings/:ratingId", doctorController.deleteDoctorRating);
export default router;
