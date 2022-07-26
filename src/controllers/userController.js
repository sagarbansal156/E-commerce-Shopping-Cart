const userModel = require("../models/userModel")
const AwsService = require("../aws/AwsService")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")

const {isEmptyVar,isValidEmail,isValidPhone,isValidPassword,isEmptyObject,isValidObjectId,isPincodeValid,isValidJSONstr,isEmptyFile,
    acceptFileType}=require("../validator/validate")




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
        

        if (file && file.length > 0) {
            if (file[0].mimetype.indexOf('image') == -1) {
                return res.status(400).send({ status: false, message: 'Only image files are allowed !' })
            }
            const profile_url = await AwsService.uploadFile(file[0]);
            data.profileImage = profile_url;
        }
        else {
            return res.status(400).send({ status: false, message: 'Profile Image is required !' })
        }
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

const updateUser = async (req, res) => {
    try {
        //  get data from body
        const data = req.body
        const files = req.files
        const userId = req.params.userId

        if (isEmptyObject(data) && isEmptyFile(files)) return res.status(400).send({ status: false, message: " BODY must be required!" })

        // get User by userID
        const user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: " User data not found!" })

        // de-structure data
        let { fname, lname, email, phone, password, address } = data


        if (isEmptyVar(fname)) {
            user.fname = fname
        }

        if (isEmptyVar(lname)) {
            user.lname = lname
        }

        if (!isEmptyVar(email)) {
            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: " Invalid email address!" })
            let usedEmail = await userModel.findOne({ email: email });
            if (usedEmail) return res.status(400).send({ status: false, Message: "This email is already registerd" });

            user.email = email
        }

        if (!isEmptyVar(phone)) {
            if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: " Invalid phone number!" })
            let usedMobileNumber = await userModel.findOne({ phone : phone });
            if (usedMobileNumber) return res.status(400).send({ status: false, Message: "This Mobile no. is already registerd" });

            user.phone = phone
        }

        if (!isEmptyVar(password)) {
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: " Please enter a valid password [A-Z] [a-z] [0-9] !@#$%^& and length with in 8-15" })
            const encryptedPassword = await bcrypt.hash(password, saltRounds)
            user.password = encryptedPassword
        }

        if (!isEmptyVar(address)) {
            let addressObj = isValidJSONstr(address)
            if (!addressObj) return res.status(400).send({ status: false, message: " JSON address NOT in a valid structure, make it in a format!" })

            address = addressObj
            let {
                shipping,
                billing
            } = address

            // shipping address validation
            if (!isEmptyObject(shipping)) {
                if (!isEmptyVar(shipping.street)) {
                    user.address.shipping.street = shipping.street
                }

                if (!isEmptyVar(shipping.city)) {
                    user.address.shipping.city = shipping.city
                }

                if (!shipping.pincode || isNaN(shipping.pincode)) {
                    if (!isPincodeValid(shipping.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode for shipping" });
                    user.address.shipping.pincode = shipping.pincode
                }
            }

            // billing address validation
            if (!isEmptyObject(billing)) {
                if (!isEmptyVar(billing.street)) {
                    user.address.billing.street = billing.street
                }

                if (!isEmptyVar(billing.city)) {
                    user.address.billing.city = billing.city
                }

                if (!billing.pincode || isNaN(billing.pincode)) {
                    if (!isPincodeValid(billing.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode for billing" });
                    user.address.billing.pincode = billing.pincode
                }
            }

        }

        if (!isEmptyFile(files)) {
            if (!acceptFileType(files[0], 'image/jpeg', 'image/png')) return res.status(400).send({ status: false, Message: "we accept jpg, jpeg or png as profile picture only" });

            const profilePicture = await uploadFile(files[0])
            user.profileImage = profilePicture
        }

        await user.save()

        res.status(200).send({status: true,Message: "User Updated successfully!",
        data: user
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: false,
            Message: error.message
        })
    }
}

module.exports ={register,login,getUser,updateUser}
