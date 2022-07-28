const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")

const {authentication,authorise} = require("../middleWare/auth")


//---------User Api----------------//
router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.get("/user/:userId/profile",authentication,userController.getUser);
router.put("/user/:userId/profile",userController.updateUser);

//----------product Api----------------//
router.post("/products", productController.addProduct);
router.get("/products", productController.getProudctsById);
router.delete("/products/:productId", productController.deleteProduct);
router.put("/products/:productId",productController.updateProductById);



module.exports = router;