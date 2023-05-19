require("dotenv").config();
const { Genre } = require("../db.js");
const axios = require("axios");

const { API_KEY } = process.env;

const getGenres = async () => {
  try {
    const genres = await Genre.findAll();
    if (genres.length) return genres;
    else {
      const genresApi = await axios.get(
        `https://api.rawg.io/api/genres?key=${API_KEY}`
      );
      const genresApiData = genresApi.data.results.map((genre) => ({
        name: genre.name,
        id: genre.id,
      }));
      await genresApiData.map((genre) =>
        Genre.create({ name: genre.name, id: genre.id })
      );

      return genresApiData;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = getGenres;
