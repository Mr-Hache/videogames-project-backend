const { Genre, Videogame, Platform } = require("../db.js");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getGamesApi = require("../utils/getGamesApi.js");
const calculationPagesApi = require("../utils/calculationPagesApi.js");
const { Op } = require("sequelize");

const getVideogamesByGenres = async (data) => {
  try {
    const { filterByGenres, page, size, API_KEY } = data;

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
          [Op.iLike]: `${filterByGenres}`,
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
    if (numberGamesDb > page * size || gamesDbOrdered.length == size)
      return {
        genre: filterByGenres,
        page,
        sizeSet: size,
        gamesData: gamesDbOrdered,
      };

    //  Obtener juegos de la API

    let gamesApi = [];
    if (gamesDbOrdered.length > 0) {
      const numberOfApiSetsRequired = size - gamesDbOrdered.length;
      gamesApi = await getGamesApi(
        API_KEY,
        [1],
        numberOfApiSetsRequired,
        filterByGenres
      );
    } else {
      const skippedPages = Math.ceil(numberGamesDb / size);
      const indexGameInitial =
        (page - skippedPages - 1) * size +
        (size > numberGamesDb ? size - numberGamesDb : numberGamesDb % size) +
        1;
      const indexGameFinal = +indexGameInitial + +size - 1;
      const residue = numberGamesDb % size;
      const pagesForApi = calculationPagesApi(
        indexGameInitial,
        indexGameFinal,
        size,
        residue
      );
      const gamesApiSet = await getGamesApi(API_KEY, pagesForApi.pages, size);
      if (pagesForApi.pages.length > 1) {
        gamesApi = gamesApiSet.slice(
          pagesForApi.lowCutIndex,
          pagesForApi.highCutIndex
        );
      } else {
        gamesApi = gamesApiSet;
      }
    }
    const gamesApiOrdered = presentationInList(gamesApi);

    const gamesData = [...gamesDbOrdered, ...gamesApiOrdered];
    if (gamesData.length === 0)
      throw new Error("No videogames found in the database or in the API ");
    return { genre: filterByGenres, page, sizeSet: size, gamesData };
  } catch (err) {
    throw err;
  }
};

module.exports = getVideogamesByGenres;
