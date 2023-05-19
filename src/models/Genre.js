const { DataTypes } = require("sequelize");

// function for defined the model of Genre
const Genre = (sequelize) => {
  // define the Genre model
  sequelize.define(
    "genre",
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

module.exports = Genre;
