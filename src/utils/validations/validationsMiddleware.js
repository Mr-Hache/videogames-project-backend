const { Genre, Platform } = require("../../db.js");
const {
  validateArray,
  validateType,
  idVerificationOfArray,
  validateID,
  validateIntegersArray,
  validateGenreName,
  validateFilterBd,
} = require("../validations/validationFunctions.js");
const { Op } = require("sequelize");

const validationCreateVideogame = async (req, res, next) => {
  const { name, genres, platforms, description, image, rating, released } =
    req.body;

  const errors = {};

  if (!name) {
    errors["name"] = "Name is required";
  }

  validateArray(
    genres,
    "Genres must be an array with at least one element",
    "genres",
    errors
  );

  validateArray(
    platforms,
    "Platforms must be an array with at least one element",
    "platforms",
    errors
  );

  if (Array.isArray(genres) && genres.length > 0) {
    const genresNotIsInteger = validateIntegersArray(genres, "genres", errors);
    if (!genresNotIsInteger) {
      await idVerificationOfArray(genres, Genre, "genres", errors);
    }
  }

  if (Array.isArray(platforms) && platforms.length > 0) {
    const platformsNotIsInteger = validateIntegersArray(
      platforms,
      "platforms",
      errors
    );
    if (!platformsNotIsInteger) {
      await idVerificationOfArray(platforms, Platform, "platforms", errors);
    }
  }

  if(rating && isFinite(rating)){
    if(rating < 0 && rating > 5){
       errors["rating"] = "Rating must be between 0 and 5";
    }}

  validateType(name, "string", "Name must be a string", "name", errors);

  description &&
    validateType(
      description,
      "string",
      "Description must be a string",
      "description",
      errors
    );

  image &&
    validateType(image, "string", "Image must be a string", "image", errors);

  rating &&
    validateType(rating, "number", "Rating must be a number", "rating", errors);

  released &&
    validateType(
      released,
      "string",
      "Released must be a string",
      "released",
      errors
    );

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

const validationDeleteVideogame = (req, res, next) => {
  const { id } = req.params;
  const errors = {};

  validateID(id, "ID", errors);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validationUpdateVideogame = async (req, res, next) => {
  const { name, genres, platforms, description, image, rating, released } =
    req.body;
  const { id } = req.params;
  const errors = {};

  validateID(id, "ID", errors);

  if (genres) {
    validateArray(
      genres,
      "Genres must be an array with at least one element",
      "genres",
      errors
    );
  }

  if (platforms) {
    validateArray(
      platforms,
      "Platforms must be an array with at least one element",
      "platforms",
      errors
    );
  }
  if(rating && isFinite(rating)){
 if(rating < 0 && rating > 5){
    errors["rating"] = "Rating must be between 0 and 5";
 }}

  if (Array.isArray(genres) && genres.length > 0) {
    const genresNotIsInteger = validateIntegersArray(genres, "genres", errors);
    if (!genresNotIsInteger) {
      await idVerificationOfArray(genres, Genre, "genres", errors);
    }
  }

  if (Array.isArray(platforms) && platforms.length > 0) {
    const platformsNotIsInteger = validateIntegersArray(
      platforms,
      "platforms",
      errors
    );
    if (!platformsNotIsInteger) {
      await idVerificationOfArray(platforms, Platform, "platforms", errors);
    }
  }

  name && validateType(name, "string", "Name must be a string", "name", errors);

  description &&
    validateType(
      description,
      "string",
      "Description must be a string",
      "description",
      errors
    );

  image &&
    validateType(image, "string", "Image must be a string", "image", errors);

  rating &&
    validateType(rating, "number", "Rating must be a number", "rating", errors);

  released &&
    validateType(
      released,
      "string",
      "Released must be a string",
      "released",
      errors
    );

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

const validationGetVideogames = async (req, res, next) => {
  const { filterByGenres, filterByBd, name } = req.query;
  const errors = {};

  if (name && (filterByBd || filterByGenres)) {
    errors["filterBy"] =
      "You can't use the name filter with the filterByGenres or filterByBd filter";
  }

  if (filterByGenres) {
    validateType(
      filterByGenres,
      "string",
      "the filter must be a string",
      "filterByGenres",
      errors
    );
    await validateGenreName(filterByGenres, Genre, Op, errors);
  }
  if (filterByBd) {
    validateType(
      filterByBd,
      "string",
      "the filter must be a string",
      "filterByBd",
      errors
    );
    validateFilterBd(filterByBd, errors);
  }
  if (name) {
    validateType(name, "string", "the filter must be a string", "name", errors);
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = {
  validationCreateVideogame,
  validationDeleteVideogame,
  validationUpdateVideogame,
  validationGetVideogames,
};
