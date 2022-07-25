const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const middleWare = require("../middleWare/auth")

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user/:userId/profile", middleWare.authentication,userController.getUser);
module.exports = router;