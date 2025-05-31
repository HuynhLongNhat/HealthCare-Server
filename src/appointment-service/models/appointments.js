const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const appointments = sequelize.define(
    "appointments",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      clinic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      booking_time: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      cancellation_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancellation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rejection_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      medical_examination_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "appointment_status",
          key: "id",
        },
      },
      approval_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      note: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "appointments",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "fk_status_id",
          using: "BTREE",
          fields: [{ name: "status_id" }],
        },
      ],
    }
  );
  appointments.associate = (models) => {
    appointments.belongsTo(models.appointment_status, {
      as: "status",
      foreignKey: "status_id",
    });
     appointments.hasMany(models.prescriptions, { as: "prescriptions", foreignKey: "appointment_id"});
  appointments.hasMany(models.diagnosis, { as: "diagnoses", foreignKey: "appointment_id"});
  };
  return appointments;
};
