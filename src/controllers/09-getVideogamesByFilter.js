const getVideogamesByGenreOrPlatform = require("./10-getVideogamesByGenreOrPlatform.js");
const getVideogamesBySource = require("./11-getVideogamesBySource.js");
const getVideogamesBySourceAndGenreOrPlatform = require("./12-getVideogamesBySourceAndGenreOrPlatform.js");
const getVideogamesByGenreAndPlatform = require("./13-getVideogamesByGenreAndPlatform.js");
const getVideogamesBySourceAndGenreAndPlatform = require("./14-getVideogamesBySourceAndGenreAndPlatform.js");
const { Platform, Genre } = require("../db.js");

const getVideogamesByFilter = async (data) => {
  try {
    const { genre, platform, source, page, size, API_KEY } = data;
    if (genre && platform && source) {
      const gamesBySourceAndGenreAndPlatform =
        await getVideogamesBySourceAndGenreAndPlatform({
          genre,
          platform,
          source,
          page,
          size,
          API_KEY,
          Platform,
          Genre,
        });
      return gamesBySourceAndGenreAndPlatform;
    }
    if (genre && platform) {
      const gamesByGenreAndPlatform = await getVideogamesByGenreAndPlatform({
        genre,
        platform,
        page,
        size,
        API_KEY,
        Genre,
        Platform,
      });
      return gamesByGenreAndPlatform;
    }
    if (genre && source) {
      const gamesBySourceAndGenre =
        await getVideogamesBySourceAndGenreOrPlatform({
          filterBy: genre,
          source,
          page,
          size,
          API_KEY,
          Model: Genre,
          typeFilter: "genre",
        });
      return gamesBySourceAndGenre;
    }
    if (platform && source) {
      const gamesBySourceAndPlatform =
        await getVideogamesBySourceAndGenreOrPlatform({
          filterBy: platform,
          source,
          page,
          size,
          API_KEY,
          Model: Platform,
          typeFilter: "platform",
        });
      return gamesBySourceAndPlatform;
    }
    if (genre) {
      const gamesByGenre = await getVideogamesByGenreOrPlatform({
        filterBy: genre,
        page,
        size,
        API_KEY,
        Model: Genre,
        typeFilter: "genre",
      });
      return gamesByGenre;
    }
    if (platform) {
      const gamesByPlatform = await getVideogamesByGenreOrPlatform({
        filterBy: platform,
        page,
        size,
        API_KEY,
        Model: Platform,
        typeFilter: "platform",
      });
      return gamesByPlatform;
    }
    if (source) {
      const gamesBySource = await getVideogamesBySource({
        source,
        page,
        size,
        API_KEY,
      });
      return gamesBySource;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = getVideogamesByFilter;
