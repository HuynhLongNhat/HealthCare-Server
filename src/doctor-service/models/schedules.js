const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const schedules = sequelize.define(
    "schedules",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "doctors",
          key: "user_id",
        },
      },
      clinic_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time_start: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      time_end: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      status : {
        type : DataTypes.STRING ,
        allowNull : false
      }
    },
    {
      sequelize,
      tableName: "schedules",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "doctor_id",
          using: "BTREE",
          fields: [{ name: "doctor_id" }],
        },
      ],
    }
  );
  schedules.associate = (models) => {
    schedules.belongsTo(models.doctors, {
      as: "doctor",
      foreignKey: "doctor_id",
    });
  };
  return schedules;
};
