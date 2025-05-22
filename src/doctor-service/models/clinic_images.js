const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const clinic_images = sequelize.define('clinic_images', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clinicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clinics',
        key: 'id'
      }
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'clinic_images',
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
        name: "clinicId",
        using: "BTREE",
        fields: [
          { name: "clinicId" },
        ]
      },
    ]
  });
  clinic_images.associate = (models) =>{
    clinic_images.belongsTo(models.clinics, { as: "clinic", foreignKey: "clinicId"});

  }
  return clinic_images;
};
