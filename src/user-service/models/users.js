const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken"); 
module.exports = function (sequelize, DataTypes) {
  const users = sequelize.define(
    "users",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        unique: "uuid",
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "username",
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "email",
      },
      
      googleId: { 
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
        facebookId: { 
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "roles",
          key: "id",
        },
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "uuid",
          unique: true,
          using: "BTREE",
          fields: [{ name: "uuid" }],
        },
        {
          name: "username",
          unique: true,
          using: "BTREE",
          fields: [{ name: "username" }],
        },
        {
          name: "email",
          unique: true,
          using: "BTREE",
          fields: [{ name: "email" }],
        },
        {
          name: "googleId", 
          unique: true,
          using: "BTREE",
          fields: [{ name: "googleId" }],
        },
      
        {
          name: "fk_role_id",
          using: "BTREE",
          fields: [{ name: "role_id" }],
        },
      ],
    }
  );
  users.prototype.generateAuthToken = function () {
    const payload = {
      id: this.id,
      email: this.email,
      fullName: this.full_name,
      role: this.role_id,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  };

  users.associate = (models) => {
    users.belongsTo(models.roles, { foreignKey: "role_id", as: "role" });
    users.hasMany(models.otps, { foreignKey: "user_id", as: "otps" });
  };
  return users;
};
