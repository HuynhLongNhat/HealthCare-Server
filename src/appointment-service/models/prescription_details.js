const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const prescription_details = sequelize.define('prescription_details', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    prescription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'prescriptions',
        key: 'id'
      }
    },
    medication_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    note: {
  type: DataTypes.TEXT,
  allowNull: true,
},
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'prescription_details',
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
        name: "prescription_id",
        using: "BTREE",
        fields: [
          { name: "prescription_id" },
        ]
      },
    ]
  });
  prescription_details.associate = function(models) {
    prescription_details.belongsTo(models.prescriptions, { as: 'prescription', foreignKey: 'prescription_id' });
  };
  return prescription_details;
};
