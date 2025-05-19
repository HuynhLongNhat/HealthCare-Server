const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const meetings =  sequelize.define('meetings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
      type: DataTypes.STRING(512),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'meetings',
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
        name: "doctor_id",
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
        ]
      },
    ]
  });
  meetings.associate = (models) => {
      meetings.belongsTo(models.doctors, { as: "doctor", foreignKey: "doctor_id"});

  }
  return meetings
};
