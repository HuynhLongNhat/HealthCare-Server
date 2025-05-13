const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const doctors = sequelize.define(
    "doctors",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      specialization_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "specializations",
          key: "id",
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      experience: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      consultation_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "doctors",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "specialization_id",
          using: "BTREE",
          fields: [{ name: "specialization_id" }],
        },
      ],
    }
  );
  doctors.associate = (models) => {
    doctors.hasMany(models.schedules, {
      as: "schedules",
      foreignKey: "doctor_id",
    });
    doctors.belongsTo(models.specializations, {
      as: "specialization",
      foreignKey: "specialization_id",
    });
    doctors.hasMany(models.clinics, {
      as: "clinics",
      foreignKey: "doctor_id",
    });
    doctors.hasMany(models.doctor_rating, { as: "doctor_ratings", foreignKey: "doctor_id"});
    doctors.hasMany(models.meeting, { as: "meetings", foreignKey: "doctor_id" });
    doctors.hasMany(models.health_handbook, { as: "health_handbooks", foreignKey: "author_id"});

  };
  return doctors;
};
