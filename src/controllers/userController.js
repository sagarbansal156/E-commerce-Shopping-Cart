const userModel = require("../models/userModel")
const AwsService = require("../aws/AwsService")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")

const {isEmptyVar,isValidEmail,isValidPhone,isValidPassword,isEmptyObject,isValidObjectId}=require("../validator/validate")




const register = async (req, res) => {
    try {
        const data = req.body;
        const file = req.files;

        //const requiredFields = ['fname', 'lname', 'email', 'phone', 'password', 'address.shipping.street', 'address.shipping.city', 'address.shipping.pincode', 'address.billing.street', 'address.billing.city', 'address.billing.pincode'];

        if(isEmptyVar(data)) return res.status(400).send({ status: false, message: 'Body cant be empty' });

        //fname and lname
        if(isEmptyVar(data.fname))return res.status(400).send({ status: false, message: 'fname required' });
        if(isEmptyVar(data.lname))return res.status(400).send({ status: false, message: 'lname required' });

        //email
        if (!isValidEmail(data.email))return res.status(400).send({ status: false, message: 'Enter a valid Email Id' });
        let isDuplicateEmail = await userModel.findOne({ email: data.email })
        if (isDuplicateEmail)return res.status(400).send({ status: false, msg: "email already exists" })
        
        //mobile
        if (!isValidPhone(data.phone))return res.status(400).send({ status: false, message: 'The mobile number must be 10 digits and should be only Indian number' });
        let duplicateMobile = await userModel.findOne({ phone: data.phone })
        if (duplicateMobile)return res.status(400).send({ status: false, msg: "mobile number already exists" })
        
        //address
        if ((/^\d{6}$/).test(data['address.shipping.pincode']))return res.status(400).send({ status: false, message: 'Enter the valid Pincode of address.shipping.pincode' });
        if ((/^\d{6}$/).test(data['address.billing.pincode']))return res.status(400).send({ status: false, message: 'Enter the valid Pincode of address.billing.pincode' });
        
        //password
        if (isValidPassword(data.password))return res.status(400).send({status: false,message: 'Minimum password should be 8 and maximum will be 15'});
        

        // if (file && file.length > 0) {
        //     if (file[0].mimetype.indexOf('image') == -1) {
        //         return res.status(400).send({ status: false, message: 'Only image files are allowed !' })
        //     }
        //     const profile_url = await AwsService.uploadFile(file[0]);
        //     data.profileImage = profile_url;
        // }
        // else {
        //     return res.status(400).send({ status: false, message: 'Profile Image is required !' })
        // }
        const dataRes = await userModel.create(data);
        return res.status(201).send({ status: true, message: "User created successfully", data: dataRes });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

const login = async (req, res) => {
    try {
        //  get data from body
        const data = req.body
        if (isEmptyObject(data)) return res.status(400).send({ status: false, message: " Login BODY must be required!" })

        //  de-structure data 
        let { email, password } = data;

        //  Basic validations
        if (isEmptyVar(email)) return res.status(400).send({ status: false, message: " Email address must be required!" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: " Invalid Email address!" })
        if (isEmptyVar(password)) return res.status(400).send({ status: false, message: " Password must be required!" })

        //  db call for login and validation
        const user = await userModel.findOne({ email })
        if (!user) return res.status(404).send({ status: false, message: ` ${email} - related user does't exist!` })

        //  vfy the password
        const verify = await bcrypt.compare(password, user.password).catch(err=> {
            console.log(err.message)
            return false
        })

        if (!verify) return res.status(401).send({ status: false, message: ` Wrong Email address or Password!` })

        //  generate Token one hr
        const Token = jwt.sign({
            userId: user._id
        }, 'secret', {
            expiresIn: '10h'
        });

        // all good
        res.status(200).send({
            status: true,
            message: `User Logged-in Successfully!`,
            data: {
                userId: user._id,
                token: Token
            }
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            Message: error.message
        })
    }
}



const getUser = async function (req, res) {

    try {

        let filter = req.params.userId

        if (req.params.hasOwnProperty('userId')) {
            if (!isValidObjectId(req.params.userId)) return res.status(400).send({ status: false, message: "please enter the valid userId!" })
        }

        let checkUser= await userModel.findOne({ _id: filter, isDeleted: false }) //Check book Name From DB/
        if (!checkUser) return res.status(404).send({ status: true, message: "No such user found" });
        
        let getUserData = await userModel.findOne({ _id:filter, isDeleted: false })

      return res.status(200).send({ status: true,message: "User profile details",data: getUserData });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};



module.exports ={register,login,getUser}
