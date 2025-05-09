var DataTypes = require("sequelize").DataTypes;
var _doctor_rating = require("./doctor_rating");

function initModels(sequelize) {
  var doctor_rating = _doctor_rating(sequelize, DataTypes);

  doctor_rating.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(doctor_rating, { as: "doctor_ratings", foreignKey: "doctor_id"});
  return {
    doctor_rating,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
