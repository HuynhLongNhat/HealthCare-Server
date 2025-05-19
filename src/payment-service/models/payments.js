const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const payments = sequelize.define(
    "payments",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      transfer_content: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "payment_status",
          key: "id",
        },
      },
      appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      payos_order_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "payments",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "status_id",
          using: "BTREE",
          fields: [{ name: "status_id" }],
        },
      ],
    }
  );
  payments.associate = (models) => {
    payments.belongsTo(models.payment_status, {
      as: "status",
      foreignKey: "status_id",
    });
  };
  return payments;
};
