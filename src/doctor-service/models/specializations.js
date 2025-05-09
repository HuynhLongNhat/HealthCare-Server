const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const specializations = sequelize.define(
    "specializations",
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
        unique: "name",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "specializations",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "name",
          unique: true,
          using: "BTREE",
          fields: [{ name: "name" }],
        },
      ],
    }
  );
  specializations.associate = (models) => {
    specializations.hasMany(models.doctors, {
      as: "doctors",
      foreignKey: "specialization_id",
    });
  };
  return specializations;
};
