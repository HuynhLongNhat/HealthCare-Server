const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const clinics = sequelize.define(
    "clinics",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
       slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      avatar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "doctors",
          key: "user_id",
        },
      },
    },
    {
      sequelize,
      tableName: "clinics",
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
  clinics.associate = (models) => {
    clinics.belongsTo(models.doctors, {
      as: "doctor",
      foreignKey: "doctor_id",
    });
    clinics.hasMany(models.clinic_images, { as: "clinic_images", foreignKey: "clinicId"});

  };
  return clinics;
};
