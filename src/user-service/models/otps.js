const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const otps = sequelize.define(
    "otps",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      otp_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      purpose: {
        type: DataTypes.ENUM("signup", "reset_password", "login"),
        allowNull: false,
      },
      expiration_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "otps",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "user_id",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );
  otps.associate = function (models) {
    otps.belongsTo(models.users, { foreignKey: "user_id", as: "user" });
  };
  return otps;
};
