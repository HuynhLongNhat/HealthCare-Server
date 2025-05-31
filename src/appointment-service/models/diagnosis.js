const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const diagnosis = sequelize.define(
    "diagnosis",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "appointments",
          key: "id",
        },
      },
      symptoms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      treatment_plan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "diagnosis",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "appointment_id",
          unique: true,
          using: "BTREE",
          fields: [{ name: "appointment_id" }],
        },
      ],
    }
  );
  diagnosis.associate = (models) => {
    diagnosis.belongsTo(models.appointments, {
      as: "appointment",
      foreignKey: "appointment_id",
    });

  };
  return diagnosis;
};
