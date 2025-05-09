const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const meeting = sequelize.define('meeting', {
    meeting_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'doctors',
        key: 'user_id'
      }
    },
    room_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    meeting_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'meeting',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "meeting_id" },
        ]
      },
      {
        name: "doctor_id",
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
        ]
      },
    ]
  });
  meeting.associate = (models) =>{
    meeting.belongsTo(models.doctors, { as: "doctor", foreignKey: "doctor_id"})
  }
  return meeting;
};
