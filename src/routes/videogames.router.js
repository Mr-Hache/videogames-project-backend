const { Router } = require("express");
const getVideogames = require("../controllers/01-getVideogames");
const createVideogame = require("../controllers/04-createVideogame");
const getVideogameById = require("../controllers/02-getVideogameById");
const updateVideogame = require("../controllers/05-updateVideogame");
const deleteVideogame = require("../controllers/08-deleteVideogame");
const videogamesRouter = Router();
const {validationCreateVideogame, validationDeleteVideogame, validationUpdateVideogame, validationGetVideogames} = require("../utils/validations/validationsMiddleware");

videogamesRouter.get("/", validationGetVideogames, async (req, res) => {
  const { name, page, size, filterByGenre,filterBySource, filterByPlatform } = req.query
  try {
    const videogames = await getVideogames({name, page, size, filterByGenre, filterBySource, filterByPlatform});
    res.status(200).json(videogames);
  } catch (error) {
    return error.message === `No videogames found with the name ${name}` || error.message === "Request failed with status code 404"
      ? res.status(404).json({ message: error.message })
      : res.status(500).json({ message: error.message });
  }
});

videogamesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const videogame = await getVideogameById(id);
    res.status(200).json(videogame);
  } catch (error) {
    return error.message ===
      "The videogame with the id " + id + " does not exist" ||
      error.message === "Request failed with status code 404"
      ? res.status(404).json({ message: error.message })
      : res.status(500).json({ message: error.message });
  }
});

videogamesRouter.post("/",validationCreateVideogame, async (req, res) => {
  const { name, description, platforms, image, released, rating, genres } =
    req.body;

  try {
    const videogame = await createVideogame({
      name,
      description,
      platforms,
      image,
      released,
      rating,
      genres,
    });
    res.status(200).json(videogame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

videogamesRouter.put("/:id",validationUpdateVideogame, async (req, res) => {
  const { id } = req.params;
  const { name, description, platforms, image, released, rating, genres } =
    req.body;

  try {
    const videogame = await updateVideogame({
      id,
      name,
      description,
      platforms,
      image,
      released,
      rating,
      genres,
    });
    res.status(200).json(videogame);
  } catch (error) {
    return error.message ===
      "The videogame with the id " + id + " does not exist"
      ? res.status(404).json({ message: error.message })
      : res.status(500).json({ message: error.message });
  }
})

videogamesRouter.delete("/:id",validationDeleteVideogame, async (req, res) => {
  const { id } = req.params;

  try {
    const videogame = await deleteVideogame(id);
    res.status(200).json(videogame);
  } catch (error) {
    return error.message ===
      "The videogame with the id " + id + " does not exist"
      ? res.status(404).json({ message: error.message })
      : res.status(500).json({ message: error.message });
  }
})


module.exports = videogamesRouter;
