const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const doctor_rating = sequelize.define('doctor_rating', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'user_id'
      }
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    professionalism_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    attitude_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    price_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'doctor_rating',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id" }]
      },
      {
        name: "doctor_id",
        using: "BTREE",
        fields: [{ name: "doctor_id" }]
      }
    ]
  });

  doctor_rating.associate = (models) => {
    doctor_rating.belongsTo(models.doctors, {
      as: "doctor",
      foreignKey: "doctor_id"
    });
  };

  return doctor_rating;
};
