const productModel = require("../models/productModel");
const AwsService = require("../aws/AwsService");
const validate = require("../validator/validate");

const addProduct = async (req, res) => {
    try {
      let data = req.body;
      let files = req.files;
  
      //checking for the valid data
      if(validate.isEmptyVar(data)) return res.status(400).send({ status: false, message: "Enter details of the product" });
  
      //checking for product title
      if(validate.isEmptyVar(data.title)) return res.status(400).send({ status: false, message: "Title is required and should not be an empty string" });
  
      //checking for duplicate title
      let checkTitle = await productModel.findOne({ title: data.title });
      if(checkTitle) return res.status(400).send({ status: false, message: "Title already exist" });
  
      //checking for product description
      if(validate.isEmptyVar(data.description) && validate.isValidString(data.description)) return res.status(400).send({ status: false, message: "Description is required and should not be an empty string or any numbers in it" });
  
      //checking for product price
      if(!(validate.isValidString(data.price) && validate.isValidPrice(data.price))) return res.status(400).send({ status: false, message: "Price of product should be valid and in numbers" });
  
      //checking for currencyId 
      if(validate.isEmptyVar(data.currencyId)) return res.status(400).send({ status: false, message: "Currency Id of product is required and should not be an empty spaces" });
  
      if(!(/INR/.test(data.currencyId))) return res.status(400).send({ status: false, message: "Currency Id of product should be in uppercase 'INR' format" });
  
      //checking for currency formate
      if(validate.isEmptyVar(data.currencyFormat)) return res.status(400).send({ status: false, message: "Currency format of product is required and should not be an empty spaces" });
  
      if(!(/₹/.test(data.currencyFormat))) return res.status(400).send({ status: false, message: "Currency format/symbol of product should be in '₹' " });
  
      //checking freeShipping value is present
      if(data?.isFreeShipping || typeof data.isFreeShipping == 'string') {
        if(!data.isFreeShipping) return res.status(400).send({ status: false, message: "Enter a valid value for is free shipping" })
        if(validate.isEmptyVar(data.isFreeShipping)) return res.status(400).send({ status: false, message: "Enter a valid value for is free shipping" })
        if(typeof data.isFreeShipping == 'string'){
          //converting it to lowercase and removing white spaces
          data.isFreeShipping = data.isFreeShipping.toLowerCase().trim();;
          if(data.isFreeShipping == 'true' || data.isFreeShipping == 'false') {
            //convert from string to boolean
            data.isFreeShipping = JSON.parse(data.isFreeShipping);
          }else {
            return res.status(400).send({ status: false, message: "Enter a valid value for isFreeShipping" })
          }
        }
        if(typeof data.isFreeShipping !== 'boolean') return res.status(400).send({ status: false, message: "Free shipping should be in boolean value" })
      }
  
      //checking for product image
      if(files.length == 0) return res.status(400).send({ status: false, message: "Please upload product image" });
  
      //uploading the product image
      let productImgUrl = await AwsService.uploadFile(files[0]);
      data.productImage = productImgUrl;
  
      //checking for style in data
      if(data?.style){
        if(validate.isEmptyVar(data.style) && validate.isValidString(data.style)) return res.status(400).send({ status: false, message: "Style should be valid an does not contain numbers" });
      }
  
      //checking for available Sizes of the products
      if(validate.isEmptyVar(data.availableSizes) && validate.isValidString(data.availableSizes))  return res.status(400).send({ status: false, message: "Enter at least one available size" });
  
      if (data.availableSizes) {
        var availableSize = data.availableSizes.toUpperCase().split(",") // Creating an array
        if (availableSize.length === 0) {
          return res.status(400).send({ status: false, message: "please provide the product sizes" })
        }
        data.availableSizes = availableSize;
      }
  
      for(let i = 0;  i < data.availableSizes.length; i++){ 
        if(!validate.isValidSize(data.availableSizes[i])) {
          return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
        }
      }
      
      //checking for installments in data
      if(data?.installments || typeof data.installments == 'string') {
        if(!validate.isValidString(data.installments)) return res.status(400).send({ status: false, message: "Installments should be in numbers" });
        if(!validate.isValidPrice(data.installments)) return res.status(400).send({ status: false, message: "Installments should be valid" });
      }
  
      let createProduct = await productModel.create(data);
      res.status(201).send({ status: true, message: "Success", data: createProduct });
    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  }




  const deleteProduct = async (req, res) => {
    try {
        // get params product id
        const productId = req.params.productId;
        //  check product id is a valid object id or not
        if (!validate.isValidObjectId(productId)) return res.status(400).send({ status: false, Message: " Invalid ProjectID!" })
        // find product by id
        const product = await productModel.findById(productId)
        if (!product) return res.status(404).send({ status: false, Message: " Product information unavailable!" })
        if (product.isDeleted) return res.status(400).send({ status: false, Message: " Product already deleted!" })

        // execute delete here
        product.isDeleted = true;
        product.deletedAt = new Date();
        await product.save();
        res.status(200).send({ status: true, Message: " Product deleted successfully!" })
    } catch (err) {
        res.status(500).send({ status: true, Message: err.message })
    }
}


  module.exports ={addProduct,deleteProduct}