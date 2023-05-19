const { Videogame, Platform, Genre } = require("../db.js");
const { Op } = require("sequelize");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getGamesApi = require("../utils/getGamesApi");

const getVideogamesByBdAndGenre = async (data) => {
  const { genre, bd, page, size, API_KEY } = data;
  if (bd === "bd") {
    const options = {
      limit: +size,
      offset: (+page - 1) * +size,
    };

    const gamesDbByGenre = await Genre.findAll({
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
          [Op.iLike]: `${genre}`,
        },
      },
    });
    const gamesDb = gamesDbByGenre[0].videogames;
    const numberGamesDb = gamesDb.length;
    const gamesDbOrdered =
      numberGamesDb > size * page
        ? presentationInList(
            gamesDb.slice(options.offset, options.offset + options.limit)
          )
        : presentationInList(gamesDb.slice(options.offset, gamesDb.length));
    return {
      genre,
      bd,
      page,
      sizeSet: size,
      gamesData: gamesDbOrdered,
    };
  }
  const gamesApi = await getGamesApi(API_KEY, [page], size, genre);
  const gamesApiOrdered = presentationInList(gamesApi);
  return {
    genre,
    bd,
    page,
    sizeSet: size,
    gamesData: gamesApiOrdered,
  };
};

module.exports = getVideogamesByBdAndGenre;
