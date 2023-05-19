// It is used to bring environment data
require("dotenv").config();
// Sequelize is imported
const { Sequelize } = require("sequelize");
// The native Node.js module is imported, which allows interaction with system files
const fs = require("fs");
// 'path' is imported, which allows handling both relative and absolute paths of the PC and the project
const path = require("path");

// The necessary variables are destructured from the environment data
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

// An instance of the Sequelize class is created using environment variables
const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  {
    // set to console.log to see the raw SQL queries
    logging: false,
    // lets Sequelize know we can use pg-native for ~30% more speed
    native: false,
  }
);

// The name of the current file is obtained
const basename = path.basename(__filename);
// An array is created to store the names of the models for later definition
const modelDefiners = [];

// All the files in the Models folder are read, required, and added to the modelDefiners array
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// The connection (sequelize) is injected into all the models
modelDefiners.forEach((model) => model(sequelize));

// This block of code gets the models from Sequelize and converts them into an object with keys that start in uppercase for example => genre : Genre
// The "Object.entries()" method is used to convert the model object into an array of arrays, where each sub-array contains the key (model name) and value (the model itself).
let entries = Object.entries(sequelize.models);
// The "map()" method is used to iterate over this array of arrays and create a new array of arrays with uppercase keys (model names) and values (the models themselves). To do this, the "toUpperCase()" method is used to convert the first character of the key to uppercase, and the "slice()" method is used to get the rest of the key starting from the second character.
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
// The "Object.fromEntries()" method is used to convert the new array of arrays into an object with uppercase keys and their corresponding values. This modified object is then assigned back to "sequelize.models", which allows access to the models using uppercase keys instead of lowercase.
sequelize.models = Object.fromEntries(capsEntries);

// It destructures the models found in sequelize.models
const { Videogame, Genre, Platform } = sequelize.models;

// "Many-to-many relationships between models are defined"
Videogame.belongsToMany(Genre, { through: "Videogame-genre" });
Genre.belongsToMany(Videogame, { through: "Videogame-genre" });
Videogame.belongsToMany(Platform, { through: "Videogame-platform" });
Platform.belongsToMany(Videogame, { through: "Videogame-platform" });

module.exports = {
  // the models are exported
  ...sequelize.models,
  // the connection is exported
  conn: sequelize,
};
