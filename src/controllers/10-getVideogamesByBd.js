const { Videogame, Genre, Platform } = require("../db.js");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getGamesApi = require("../utils/getGamesApi");

const getVideogameByBd = async (data) => {
  try {
    const { filterByBd, page, size, API_KEY } = data;

    if (filterByBd == "bd") {
      const options = {
        limit: +size,
        offset: (+page - 1) * +size,
      };
      const gamesDb = await Videogame.findAll({
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
        offset: options.offset,
        limit: options.limit,
      });

      const gamesDbOrdered = presentationInList(gamesDb);
      return gamesDbOrdered;
    } else {
      const gamesApi = await getGamesApi(API_KEY, [page], size);
      const gamesApiOrdered = presentationInList(gamesApi);
      return gamesApiOrdered;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogameByBd;
