const { Router } = require("express");
const platformsRouter = Router();
const getPlatforms = require("../controllers/07-getPlatforms");

platformsRouter.get("/", async (req, res) => {
  try {
    const platforms = await getPlatforms();
    res.status(200).json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = platformsRouter;
