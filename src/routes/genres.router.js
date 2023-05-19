const { Router } = require("express");
const genresRouter = Router();
const getGenres = require("../controllers/06-getGenres");

genresRouter.get("/", async (req, res) => {
  try {
    const genres = await getGenres();
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = genresRouter;
