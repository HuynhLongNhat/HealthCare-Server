var DataTypes = require("sequelize").DataTypes;
var _clinics = require("./clinics");
var _doctors = require("./doctors");
var _schedules = require("./schedules");
var _specializations = require("./specializations");
var _clinic_images = require("./clinic_images");

function initModels(sequelize) {
  // Khởi tạo các model
  var clinics = _clinics(sequelize, DataTypes);
  var doctors = _doctors(sequelize, DataTypes);
  var schedules = _schedules(sequelize, DataTypes);
  var specializations = _specializations(sequelize, DataTypes);
  var clinic_images = _clinic_images(sequelize, DataTypes);

  // Định nghĩa các mối quan hệ
  clinics.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(clinics, { as: "clinics", foreignKey: "doctor_id"});
  
  schedules.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(schedules, { as: "schedules", foreignKey: "doctor_id"});
  
  doctors.belongsTo(specializations, { as: "specialization", foreignKey: "specialization_id"});
  specializations.hasMany(doctors, { as: "doctors", foreignKey: "specialization_id"});
  
  clinic_images.belongsTo(clinics, { as: "clinic", foreignKey: "clinicId"});
  clinics.hasMany(clinic_images, { as: "clinic_images", foreignKey: "clinicId"});

  // Trả về các model và các mối quan hệ
  return {
    clinics,
    doctors,
    schedules,
    specializations,
    clinic_images,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
