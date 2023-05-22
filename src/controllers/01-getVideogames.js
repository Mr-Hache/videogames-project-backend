require("dotenv").config();
const { Videogame, Genre, Platform } = require("../db.js");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getVideogamesByName = require("./03-getVideogamesByName.js");
const { API_KEY } = process.env;
const calculationPagesApi = require("../utils/calculationPagesApi.js");
const getGamesApi = require("../utils/getGamesApi");
const getVidegamesByFilter = require("./09-getVideogamesByFilter.js");

// funcion que trae los juegos tanto de la base de datos como de la api, OMITIR si viene ocn nombre en el req.query
const getVideogames = async (data) => {
  const {
    name,
    page = 1,
    size = 10,
    filterByGenre,
    filterBySource,
    filterByPlatform,
  } = data;
  filterByGenre ? filterByGenre.toLowerCase() : null;
  filterBySource ? filterBySource.toLowerCase() : null;
  filterByPlatform ? filterByPlatform.toLowerCase() : null;
  const options = {
    limit: +size,
    offset: (+page - 1) * +size,
  };

  try {
    if (name) {
      const gamesByName = await getVideogamesByName(name);
      return gamesByName;
    }
    if (filterByGenre || filterBySource || filterByPlatform) {
      const gamesByFilter = await getVidegamesByFilter({genre: filterByGenre, platform: filterByPlatform, source: filterBySource, page, size, API_KEY });
      return gamesByFilter;
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
      order : [["name", "ASC"]],
      
    });
    const gamesDbOrdered = presentationInList(gamesDb);
    const numberGamesDb = await Videogame.count();
    if (numberGamesDb > page * size || gamesDbOrdered.length == size)
      return { page, sizeSet: gamesDbOrdered.length, gamesData: gamesDbOrdered };

    //  Obtener juegos de la API

    let gamesApi = [];
    if (gamesDbOrdered.length > 0) {
      const numberOfApiSetsRequired = size - gamesDbOrdered.length;
      gamesApi = await getGamesApi({
        key: API_KEY,
        pages: [1],
        size: numberOfApiSetsRequired,
      });
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

      const gamesApiSet = await getGamesApi({
        key: API_KEY,
        pages: pagesForApi.pages,
        size,
      });
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
      return ({message: "No videogames found in the database or in the API "});
    return { page, sizeSet: gamesData.length, gamesData };
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogames;
