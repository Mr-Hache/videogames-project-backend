const { Videogame } = require("../db.js");

const deleteVideogame = async (id) => {
  try {
    const videogame = await Videogame.findByPk(id);
    if (!videogame) {
      throw new Error("The videogame with the id " + id + " does not exist");
    }
    await videogame.destroy();
    return `The videogame with the id ${id} was deleted`;
  } catch (error) {
    throw error;
  }
};

module.exports = deleteVideogame;
