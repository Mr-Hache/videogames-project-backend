const { Videogame, Platform, Genre } = require("../db.js");
const { Op } = require("sequelize");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getGamesApi = require("../utils/getGamesApi");

const getVideogamesBySourceAndGenreOrPlatform = async (data) => {
  try {
    const { filterBy, source, page, size, API_KEY, Model, typeFilter } = data;
    if (source === "bd") {
      const options = {
        limit: +size,
        offset: (+page - 1) * +size,
      };

      const gamesDbBy = await Model.findAll({
        include: [
          {
            model: Videogame,
            attributes: ["id", "name", "released", "rating", "image"],
            through: {
              attributes: [],
            },
            include: [
              {
                model: Platform,
                attributes: ["name"],
                through: { attributes: [] },
              },
              {
                model: Genre,
                attributes: ["name"],
                through: { attributes: [] },
              },
            ],
          },
        ],
        where: {
          name: {
            [Op.iLike]: `${filterBy}`,
          },
        },
        order: [[Videogame, "name", "ASC"]],
      });
      const gamesDb = gamesDbBy[0].videogames;
      const numberGamesDb = gamesDb.length;
      const gamesDbOrdered =
        numberGamesDb > size * page
          ? presentationInList(
              gamesDb.slice(options.offset, options.offset + options.limit)
            )
          : presentationInList(gamesDb.slice(options.offset, gamesDb.length));

      if (gamesDbOrdered.length === 0)
        return { message: "No videogames found with that filter" };
      return {
        genre: typeFilter == "genre" ? filterBy : null,
        platform: typeFilter == "platform" ? filterBy : null,
        source,
        page,
        sizeSet: gamesDbOrdered.length,
        gamesData: gamesDbOrdered,
      };
    }

    const idPlatform = await Platform.findOne({
      where: {
        name: {
          [Op.iLike]: `${filterBy}`,
        },
      },
    });
    const gamesApi = await getGamesApi({
      key: API_KEY,
      pages: [page],
      size,
      platform: typeFilter == "platform" ? filterBy : null,
      genre: typeFilter == "genre" ? filterBy : null,
      idPlatform: idPlatform ? idPlatform.id : null,
    });

    const gamesApiOrdered = presentationInList(gamesApi);
    if (gamesApiOrdered.length === 0)
      return { message: "No videogames found with that filter" };
    return {
      genre: typeFilter == "genre" ? filterBy : null,
      platform: typeFilter == "platform" ? filterBy : null,
      source,
      page,
      sizeSet: gamesApiOrdered.length,
      gamesData: gamesApiOrdered,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogamesBySourceAndGenreOrPlatform;
