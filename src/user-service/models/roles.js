const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const roles = sequelize.define(
    "roles",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      role: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "roles",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  roles.associate = function (models) {
    roles.hasMany(models.users, {
      foreignKey: "role_id",
      as: "users",
    });
  };
  return roles;
};
