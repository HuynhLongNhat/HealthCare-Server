var DataTypes = require("sequelize").DataTypes;
var _appointment_status = require("./appointment_status");
var _appointments = require("./appointments");

function initModels(sequelize) {
  var appointment_status = _appointment_status(sequelize, DataTypes);
  var appointments = _appointments(sequelize, DataTypes);

  appointments.belongsTo(appointment_status, { as: "status", foreignKey: "status_id"});
  appointment_status.hasMany(appointments, { as: "appointments", foreignKey: "status_id"});

  return {
    appointment_status,
    appointments,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
