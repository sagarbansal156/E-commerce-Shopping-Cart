<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")


router.post("/register", userController.register);
router.post("/login", userController.login)


=======
const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const middleWare = require("../middleWare/auth")

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user/:userId/profile", middleWare.authentication,userController.getUser);
>>>>>>> 85e564ef25d6f1ab0b03ab6f9dbc9ff2a5ce6bd4
module.exports = router;