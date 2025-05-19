const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const payment_status = sequelize.define('payment_status', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    status_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "status_name"
    }
  }, {
    sequelize,
    tableName: 'payment_status',
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
        name: "status_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "status_name" },
        ]
      },
    ]
  });
  payment_status.associate = (models) => {
       payment_status.hasMany(models.payments, { as: "payments", foreignKey: "status_id"});

  }
  return payment_status;
};
