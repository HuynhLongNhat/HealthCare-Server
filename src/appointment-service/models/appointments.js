const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const appointments = sequelize.define(
    "appointments",
    {
      appointment_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
      },
      patient_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      doctor_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      appointment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      note: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      booking_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      approval_time  :{
          type: DataTypes.DATE,
        allowNull: true,
      },
      cancellation_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancellation_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rejection_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status_id: {
        type: DataTypes.TINYINT,
        allowNull: false,
        references: {
          model: "appointment_status",
          key: "status_id",
        },
      },
    },
    {
      sequelize,
      tableName: "appointments",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "appointment_id" }],
        },
        {
          name: "status_id",
          using: "BTREE",
          fields: [{ name: "status_id" }],
        },
      ],
    }
  );
  appointments.associate = (models) =>{
      appointments.belongsTo(models.appointment_status, {
        as: "status",
        foreignKey: "status_id",
      });

  };
  return appointments;
};
