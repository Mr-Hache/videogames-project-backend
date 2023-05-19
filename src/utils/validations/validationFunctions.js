const { validate: validateUUID } = require("uuid");

const validateID = (id, type, errors) => {
  if (!validateUUID(id)) {
    errors[`validateID/${type}`] = `The id ${id} is not valid`;
  }
};
const validateType = (value, expectedType, errorMessage, type, errors) => {
  if (typeof value !== expectedType) {
    errors[`validateType/${type}`] = errorMessage;
  }
};

const validateArray = (value, errorMessage, type, errors) => {
  if (!Array.isArray(value) || value.length === 0) {
    errors[`validateArray/${type}`] = errorMessage;
  }
};

const validateIntegersArray = (value, type, errors) => {
  const numberDiferent = value.filter((element) => typeof element !== "number");
  if (numberDiferent.length > 0) {
    errors[
      `validateIntegersArray/${type}`
    ] = `The array ${type} must be of numbers, it contains different elements (${numberDiferent.join(
      ", "
    )})`;
    return true;
  }
  return false;
};

const idVerificationOfArray = async (array, Model, type, errors) => {
  const promises = array.map((id) => Model.findByPk(id));
  const results = await Promise.all(promises);
  const missing = [];
  for (let i = 0; i < results.length; i++) {
    if (!results[i]) {
      missing.push(array[i]);
    }
  }
  if (missing.length > 0) {
    errors[
      `idVerificationOfArray/${type}`
    ] = `The following ids are not valid: ${missing.join(", ")} in ${type}`;
  }
};

const validateGenreName = async (genreName, Model, Op, errors) => {
  const genre = await Model.findOne({
    where: { name: { [Op.iLike]: genreName } },
  });
  if (!genre) {
    errors[
      `genreVerification/${genreName}`
    ] = `The genre ${genreName} does not exist`;
  }
};

const validateFilterBd = (bd, errors) => {
  if (bd !== "bd" && bd !== "api") {
    errors[`validateFilterDb/${bd}`] = `The filter ${bd} is not valid`;
  }
};

module.exports = {
  validateType,
  validateArray,
  idVerificationOfArray,
  validateID,
  validateIntegersArray,
  validateGenreName,
  validateFilterBd,
};
