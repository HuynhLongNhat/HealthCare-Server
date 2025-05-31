const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const prescriptions = sequelize.define('prescriptions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'appointments',
        key: 'id'
      }
    },
  }, {
    sequelize,
    tableName: 'prescriptions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "appointment_id",
        using: "BTREE",
        fields: [
          { name: "appointment_id" },
        ]
      },
    ]
  });
  prescriptions.associate = function(models) {
    prescriptions.belongsTo(models.appointments, { as: 'appointment', foreignKey: 'appointment_id' });
    prescriptions.hasMany(models.prescription_details, { as: 'prescription_details', foreignKey: 'prescription_id' });
  };
  return prescriptions;

  
};
