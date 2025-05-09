var DataTypes = require("sequelize").DataTypes;
var _otps = require("./otps");
var _roles = require("./roles");
var _users = require("./users");

function initModels(sequelize) {
  var otps = _otps(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  users.belongsTo(roles, { as: "role", foreignKey: "role_id" });
  roles.hasMany(users, { as: "users", foreignKey: "role_id" });
  otps.belongsTo(users, { as: "user", foreignKey: "user_id" });
  users.hasMany(otps, { as: "otps", foreignKey: "user_id" });

  return {
    otps,
    roles,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
