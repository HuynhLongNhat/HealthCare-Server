const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const appointment_status = sequelize.define('appointment_status', {
    status_id: {
      autoIncrement: true,
      type: DataTypes.TINYINT,
      allowNull: false,
      primaryKey: true
    },
    status_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'appointment_status',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "status_id" },
        ]
      },
    ]
  });

  appointment_status.associate = (models) => {
     appointment_status.hasMany(models.appointments, {
       as: "appointments",
       foreignKey: "status_id",
     });
  };
  return appointment_status;
};
