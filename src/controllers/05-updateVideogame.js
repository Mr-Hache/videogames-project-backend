const { Videogame } = require("../db.js");
const getVideogameById = require("./02-getVideogameById.js");
const updateVideogame = async (data) => {
  const { id, name, description, platforms, image, released, rating, genres } =
    data;
  try {
    const videogame = await Videogame.findByPk(id);
    if (!videogame) {
      throw new Error("The videogame with the id " + id + " does not exist");
    }
    const videogameGenres = await videogame.getGenres();
    const videogamePlatforms = await videogame.getPlatforms();
    await videogame.setGenres(genres || videogameGenres);
    await videogame.setPlatforms(platforms || videogamePlatforms);
    await videogame.update({
      name: name || videogame.name,
      description: description || videogame.description,
      image: image || videogame.image,
      released: released || videogame.released,
      rating: rating || videogame.rating,
    });
    const videogameData = await getVideogameById(id);
    return videogameData;
  } catch (error) {
    throw error;
  }
};

module.exports = updateVideogame;
