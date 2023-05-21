const { Genre, Videogame, Platform } = require("../db.js");
const { presentationInList } = require("../utils/presentationFunctions.js");
const getGamesApi = require("../utils/getGamesApi.js");
const calculationPagesApi = require("../utils/calculationPagesApi.js");
const { Op } = require("sequelize");

const getVideogamesByGenreOrPlatform = async (data) => {
  try {
    const { filterBy, page, size, API_KEY, Model, typeFilter } = data;

    const idPlatform = await Platform.findOne({
      where: {
        name: {
          [Op.iLike]: `${filterBy}`,
        },
      },
    });

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
    if (numberGamesDb > page * size || gamesDbOrdered.length == size)
      return {
        genre: typeFilter == "genre" ? filterBy : null,
        platform: typeFilter == "platform" ? filterBy : null,
        page,
        sizeSet: gamesDbOrdered.length,
        gamesData: gamesDbOrdered,
      };

    //  Obtener juegos de la API

    let gamesApi = [];
    if (gamesDbOrdered.length > 0) {
      const numberOfApiSetsRequired = size - gamesDbOrdered.length;
      gamesApi = await getGamesApi({
        key: API_KEY,
        pages: [1],
        size: numberOfApiSetsRequired,
        platform: typeFilter == "platform" ? filterBy : null,
        genre: typeFilter == "genre" ? filterBy : null,
        idPlatform: idPlatform ? idPlatform.id : null,
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
        platform: typeFilter == "platform" ? filterBy : null,
        genre: typeFilter == "genre" ? filterBy : null,
        idPlatform: idPlatform ? idPlatform.id : null,
      });
      if (pagesForApi.pages.length > 1) {
        gamesApi = gamesApiSet.slice(
          pagesForApi.lowCutIndex,
          pagesForApi.highCutIndex
        );
      } else {
        gamesApi = gamesApiSet;
      }
      // return {indexGameFinal, indexGameInitial, residue, pagesForApi, skippedPages}
    }
    const gamesApiOrdered = presentationInList(gamesApi);

    const gamesData = [...gamesDbOrdered, ...gamesApiOrdered];
    if (gamesData.length === 0)
      return { message: "No videogames found with that filter " };
    return {
      genre: typeFilter == "genre" ? filterBy : null,
      platform: typeFilter == "platform" ? filterBy : null,
      page,
      sizeSet: gamesData.length,
      gamesData,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = getVideogamesByGenreOrPlatform;
