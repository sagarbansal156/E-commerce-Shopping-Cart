const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const {authentication,authorise} = require("../middleWare/auth")


//---------User Api----------------//
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user/:userId/profile",authentication,userController.getUser);
router.put("/user/:userId/profile",userController.updateUser);





module.exports = router;