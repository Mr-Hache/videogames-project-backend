const { Videogame } = require("../db.js");
const getVideogameById = require("./02-getVideogameById.js");

const createVideogame = async (data) => {
  const { name, description, platforms, image, released, rating, genres } =
    data;

  try {
    const videogame = await Videogame.create({
      name,
      description: description || "No description available",
      image: image || "https://i.imgur.com/0kZB2y1.png",
      released: released || "No release date available",
      rating: rating || "No rating available",
    });
    await videogame.addGenres(genres);
    await videogame.addPlatforms(platforms);
    const videogameCreated = await getVideogameById(videogame.id);
    return videogameCreated;
  } catch (error) {
    throw error;
  }
};

module.exports = createVideogame;
