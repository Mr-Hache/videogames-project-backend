const { Videogame, Genre, Platform } = require("../db.js");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getGamesApi = require("../utils/getGamesApi");

const getVideogameBySource = async (data) => {
  try {
    const { source, page, size, API_KEY } = data;

    if (source == "bd") {
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
        order: [["name", "ASC"]],
      });

      const gamesDbOrdered = presentationInList(gamesDb);
      const gamesNumber = Videogame.count();

      if (gamesDbOrdered.length === 0)
        return { message: "No videogames found in the database" };
      return {
        genre: null,
        platform: null,
        source,
        page,
        sizeSet: gamesDbOrdered.length,
        gamesData: gamesDbOrdered,
      };
    } else {
      const gamesApi = await getGamesApi({ key: API_KEY, pages: [page], size });
      const gamesApiOrdered = presentationInList(gamesApi);
      if (gamesApiOrdered.length === 0)
        return { message: "No videogames found in the API" };
      return {
        genre: null,
        platform: null,
        source,
        page,
        sizeSet: gamesApiOrdered.length,
        gamesData: gamesApiOrdered,
      };
    }
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogameBySource;
