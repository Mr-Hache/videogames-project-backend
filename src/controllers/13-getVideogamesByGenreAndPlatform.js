const { Videogame } = require("../db.js");
const { presentationInList } = require("../utils/presentationFunctions.js");
const { Op } = require("sequelize");
const getGamesApi = require("../utils/getGamesApi");
const calculationPagesApi = require("../utils/calculationPagesApi");

const getVideogamesByGenreAndPlatform = async (data) => {
  try {
    const { genre, platform, page, size, API_KEY, Genre, Platform } = data;

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
    const numberGamesDb = gamesDb.length;
    const gamesDbOrdered =
      numberGamesDb > size * page
        ? presentationInList(
            gamesDb.slice(options.offset, options.offset + options.limit)
          )
        : presentationInList(gamesDb.slice(options.offset, gamesDb.length));

    if (numberGamesDb > page * size || gamesDbOrdered.length == size)
      return {
        genre,
        platform,
        page,
        sizeSet: gamesDbOrdered.length,
        gamesData: gamesDbOrdered,
      };

    //  Obtener juegos de la API

    let gamesApi = [];

    if (gamesDbOrdered.length > 0) {
      const numberOfApiSetsRequired = size - gamesDbOrdered.length;
      //return { numberOfApiSetsRequired, key: API_KEY, pages: [1], size : numberOfApiSetsRequired, platform, genre, idPlatform: platformId.id };
      gamesApi = await getGamesApi({
        key: API_KEY,
        pages: [1],
        size: numberOfApiSetsRequired,
        platform,
        genre,
        idPlatform: platformId.id,
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
        platform,
        genre,
        idPlatform: platformId.id,
      });

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
      return { message: "No videogames found with these filters" };
    return {
      genre,
      platform,
      page,
      sizeSet: gamesData.length,
      gamesData,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = getVideogamesByGenreAndPlatform;
