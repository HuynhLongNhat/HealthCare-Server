var DataTypes = require("sequelize").DataTypes;
var _payment_status = require("./payment_status");
var _payments = require("./payments");

function initModels(sequelize) {
  var payment_status = _payment_status(sequelize, DataTypes);
  var payments = _payments(sequelize, DataTypes);

  payments.belongsTo(payment_status, { as: "status", foreignKey: "status_id"});
  payment_status.hasMany(payments, { as: "payments", foreignKey: "status_id"});

  return {
    payment_status,
    payments,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
