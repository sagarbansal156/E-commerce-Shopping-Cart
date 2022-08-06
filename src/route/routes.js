const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cart = require("../controllers/cartController")
const middleWare = require("../middleWare/auth")


//---------User Api----------------//
router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.get("/user/:userId/profile",middleWare.authentication,userController.getUser);
router.put("/user/:userId/profile",middleWare.authentication,userController.updateUser);

//----------product Api----------------//
router.post("/products", productController.addProduct);
router.get("/products", productController.getProudcts);//by query
router.get("/products/:productId", productController.getProudctsById);//by params
router.delete("/products/:productId", productController.deleteProduct);
router.put("/products/:productId",productController.updateProductById);

//--------cart Api-----------//
router.post('/users/:userId/cart', cart.createCart)
router.get('/users/:userId/cart', cart.getCart)
router.put('/users/:userId/cart', cart.updateCart)
router.delete('/users/:userId/cart', cart.deleteCart)



module.exports = router;