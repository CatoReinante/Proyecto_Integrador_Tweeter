const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { expressjwt: checkJwt } = require("express-jwt");
require("dotenv").config();

/*
 * API endpoints relacionados a los usuarios.
 *
 * Notar que todos estos endpoints tienen como prefijo el string "/users",
 * tal como se definió en el archivo `routes/index.js`.
 */

router.post("/", userController.store);
router.use(checkJwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] }));
router.get("/:username", userController.show);
router.get("/followers/:id", userController.followersIndex);
// router.patch("/followers", userController.follow);
router.get("/following/:id", userController.followingIndex);
router.patch("/follow/:id", userController.follow); //para el id del otro

module.exports = router;
