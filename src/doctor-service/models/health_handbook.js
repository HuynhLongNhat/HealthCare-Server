const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const health_handbook =  sequelize.define('health_handbook', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "slug"
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'doctors',
        key: 'user_id'
      }
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Lượt xem"
    }
  }, {
    sequelize,
    tableName: 'health_handbook',
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
        name: "slug",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "slug" },
        ]
      },
      {
        name: "author_id",
        using: "BTREE",
        fields: [
          { name: "author_id" },
        ]
      },
    ]
  });
  health_handbook.associate = (models) => {
      health_handbook.belongsTo(models.doctors, { as: "author", foreignKey: "author_id"});

  }
  return health_handbook;
};
