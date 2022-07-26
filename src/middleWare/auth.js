let jwt = require("jsonwebtoken")
const mongoose = require('mongoose');
const {isEmptyVar}=require("../validator/validate")



const isValidObjectId = (ObjectId) => {
  return mongoose.Types.ObjectId.isValid(ObjectId);   // to validate a MongoDB ObjectId we are use .isValid() method on ObjectId
};

/****************************************(Authentication)*****************************************************/
const authentication = (req, res, next) => {
    try{
        let token = req.headers.authorization
        if(isEmptyVar(token)) return res.status(400).send({ status: false, Message: " The token must be required in 'Bearer'" })
        // split and get the token only 
        token = token.split(' ')[1] // get the 1 index value
        jwt.verify(token,'secret',function(err,decode){
            if(err){ 
                return res.status(401).send({ status: false, Message: err.message })
            }else{
                req.tokenData = decode;
                next()
            }
        })
    }catch(err){
        res.status(500).send({ status: false, Message: err.message })
    }
}
  /*********************************************(Authorization)************************************************ */
//   const authorise = async function (req, res, next) {
//     try {
  
//       let loginAuthor = decodedToken.userId;
  
//       let userLogging;
  
  
  
//       /**validation for path params */
//       if (req.params.hasOwnProperty('bookId')) {
//         if (!isValidObjectId(req.params.bookId))return res.status(400).send({ status: false, msg: "Enter a valid book Id" }) 
  
//         let bookData = await bookModel.findById(req.params.bookId);        
  
//         if (!bookData)                                          //you entering the author id here of any othor author
//           return res.status(404).send({ status: false, msg: "Error, Please check Id and try again" });
  
//         userLogging = bookData.userId.toString();
    
  
//       }
  
//        if (loginAuthor !== userLogging)
//         return res.status(403).send({ status: false, msg: "Error, authorization failed" });
        
//         next()
    
//       } 
//       catch (err) {
//        res.status(500).send({ status: false ,message: err.msg })
//     }
   
//   }
  
module.exports = { authentication}