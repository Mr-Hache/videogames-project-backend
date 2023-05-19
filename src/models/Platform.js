const { DataTypes } = require("sequelize");

// function for defined the model of Platform
const Platform = (sequelize) => {
  // define the platform model
  sequelize.define(
    "platform",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};

module.exports = Platform;
