require("dotenv").config();
const { Videogame, Genre, Platform } = require("../db.js");
const axios = require("axios");
const { presentationInDetail } = require("../utils/presentationFunctions.js");
const { validate: validateUUID } = require("uuid");
const { API_KEY } = process.env;

const getVideogameById = async (id) => {
  try {
    if (validateUUID(id)) {
      const videogameDb = await Videogame.findOne({
        where: { id },
        include: [
          {
            model: Genre,
            attributes: ["name"],
            through: {
              attributes: [],
            },
          },
          {
            model: Platform,
            attributes: ["name"],
            through: {
              attributes: [],
            },
          },
        ],
      });
      if (!videogameDb)
        throw new Error("The videogame with the id " + id + " does not exist");
      return presentationInDetail(videogameDb);
    }

    const videogameApi = await axios.get(
      `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
    );
    return presentationInDetail(videogameApi.data);
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogameById;
