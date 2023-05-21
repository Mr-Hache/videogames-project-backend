const { presentationInList } = require("../utils/presentationFunctions");
const { Videogame } = require("../db.js");
const { Op } = require("sequelize");
const getGamesApi = require("../utils/getGamesApi");

const getVideogamesBySourceAndGenreAndPlatform = async (data) => {
  try {
    const { genre, platform, source, page, size, API_KEY, Genre, Platform } =
      data;
    const options = {
      limit: +size,
      offset: (+page - 1) * +size,
    };
    const genreId = await Genre.findOne({
      where: {
        name: {
          [Op.iLike]: `${genre}`,
        },
      },
    });
    const platformId = await Platform.findOne({
      where: {
        name: {
          [Op.iLike]: `${platform}`,
        },
      },
    });
    if (source == "bd") {
      const gamesDbFiltered = await Videogame.findAll({
        include: [
          {
            model: Genre,
            where: {
              id: genreId.id, // Filtra por los IDs de géneros especificados
            },
          },
          {
            model: Platform,
            where: {
              id: platformId.id, // Filtra por los IDs de plataformas especificados
            },
          },
        ],
        order: [["name", "ASC"]],
        offset: options.offset,
        limit: options.limit,
      });

      const PromisesWithIdGames = gamesDbFiltered.map(async (game) => {
        return await Videogame.findOne({
          where: {
            id: game.id,
          },
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
      });

      const gamesDb = await Promise.all(PromisesWithIdGames);
      const gamesDbOrdered = presentationInList(gamesDb);

      if (gamesDbOrdered.length === 0) {
        return {
          message: "videogames not found in database with these filters",
        };
      }
      return {
        page: +page,
        size,
        source,
        platform,
        genre,
        gamesData: gamesDbOrdered,
      };
    }
    if (source == "api") {
      const gamesApi = await getGamesApi({
        key: API_KEY,
        genre,
        platform,
        pages: [page],
        size,
        idPlatform: platformId.id,
      });
      const gamesApiOrdered = presentationInList(gamesApi);

      if (gamesApiOrdered.length === 0) {
        return {
          message: "videogames not found in api with these filters",
        };
      }
      return {
        page: +page,
        size,
        source,
        platform,
        genre,
        gamesData: gamesApiOrdered,
      };
    }
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogamesBySourceAndGenreAndPlatform;
