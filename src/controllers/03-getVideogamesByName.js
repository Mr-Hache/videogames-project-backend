require("dotenv").config();
const { Videogame, Genre, Platform } = require("../db.js");
const axios = require("axios");
const { presentationInList } = require("../utils/presentationFunctions.js");
const { API_KEY } = process.env;
const { Op } = require("sequelize");

const getVideogamesByName = async (name) => {
  try {
    const videogamesDb = await Videogame.findAll({
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
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
      limit: 15,
    });

    const videogamesDbData = presentationInList(videogamesDb);

    if (videogamesDbData.length == 15) return videogamesDbData;

    const videogamesApi = await axios.get(
      `https://api.rawg.io/api/games?search=${name}&key=${API_KEY}`
    );
    const videogamesApiData = presentationInList(videogamesApi.data.results);
    const data = [...videogamesDbData, ...videogamesApiData];

    return data.length === 0
      ? (() => {
          throw new Error("No videogames found with the name " + name);
        })()
      : data.length <= 15
      ? data
      : data.slice(0, 15);
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogamesByName;
