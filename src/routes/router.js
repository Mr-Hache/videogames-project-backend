const { Router } = require("express");
const videogamesRouter = require("./videogames.router.js");
const genresRouter = require("./genres.router.js");
const platformsRouter = require("./platforms.router.js");
const welcomeMessage = require("../utils/welcomeMessage.js");

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({ message: welcomeMessage });
})
router.use("/videogames", videogamesRouter);
router.use("/genres", genresRouter);
router.use("/platforms", platformsRouter);

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

module.exports = router;
