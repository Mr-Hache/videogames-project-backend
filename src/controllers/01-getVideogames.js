require("dotenv").config();
const { Videogame, Genre, Platform } = require("../db.js");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getVideogamesByName = require("./03-getVideogamesByName.js");
const { API_KEY } = process.env;
const calculationPagesApi = require("../utils/calculationPagesApi.js");
const getGamesApi = require("../utils/getGamesApi");
const getVideogamesByGenres = require("./09-getVideogamesByGenres.js");
const getVideogamesByBd = require("./10-getVideogamesByBd.js");
const getVideogamesByBdAndGenre = require("./11-getVideogamesByBdAndGenre.js");

// funcion que trae los juegos tanto de la base de datos como de la api, OMITIR si viene ocn nombre en el req.query
const getVideogames = async (data) => {
  const { name, page = 1, size = 10, filterByGenres, filterByBd } = data;
  const options = {
    limit: +size,
    offset: (+page - 1) * +size,
  };

  try {
    if (name) {
      const gamesByName = await getVideogamesByName(name);
      return gamesByName;
    }
    if (filterByBd && filterByGenres) {
      const gamesByBdAndGenre = await getVideogamesByBdAndGenre({
        genre: filterByGenres,
        bd: filterByBd,
        page,
        size,
        API_KEY,
      });
      return gamesByBdAndGenre;
    }
    if (filterByGenres) {
      const gamesByGenres = await getVideogamesByGenres({
        API_KEY,
        filterByGenres,
        page,
        size,
        filterByGenres,
      });
      return gamesByGenres;
    }

    if (filterByBd) {
      const gamesByBd = await getVideogamesByBd({
        API_KEY,
        filterByBd,
        page,
        size,
      });
      return gamesByBd;
    }

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
    const numberGamesDb = await Videogame.count();
    if (numberGamesDb > page * size || gamesDbOrdered.length == size)
      return { page, sizeSet: size, gamesData: gamesDbOrdered };

    //  Obtener juegos de la API

    let gamesApi = [];
    if (gamesDbOrdered.length > 0) {
      const numberOfApiSetsRequired = size - gamesDbOrdered.length;
      gamesApi = await getGamesApi(API_KEY, [1], numberOfApiSetsRequired);
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
      // return {skippedPages, indexGameInitial, indexGameFinal, pagesForApi}
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
    return { page, sizeSet: size, gamesData };
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogames;
