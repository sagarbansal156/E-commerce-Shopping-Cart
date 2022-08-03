const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const validate = require('../validator/validate')
/*---------------------- create cart ----------------------*/

const create = async (req, res) => {
    try {
        // get body here
        const data = req.body
        const userId = req.params.userId

        // check body validation
        if (validate.isEmptyVar(data)) 
        return res.status(400).send({ status: false, Message: " Post Body is empty, Please add some key-value pairs" })
        
        // destructure data here
        let { productId, quantity, cartId } = data
        // if quantity does't exist then add 1 default
        quantity = quantity || 1;
        // validate products

        if (validate.isEmptyVar(productId))  return res.status(400).send({ status: false, Message: " ProductId is required!" })

        if (!validate.isValidObjectId(productId))
        return res.status(400).send({ status: false, Message: " Invalid ProductId!" }) 
        // validate quantity

        if (validate.isEmptyVar(quantity)) return res.status(400).send({ status: false, Message: "  Quantity is required!" })

        if (typeof quantity != 'number') return res.status(400).send({ status: false, Message: " Quantity must be a number!" })

        if (Number(quantity) < 1) return res.status(400).send({ status: false, Message: " Quantity should be  >= 1 !" })
    

        // is a valid id 
        if (!validate.isValidObjectId(userId)) return res.status(400).send({ status: false, Message: " Invalid userId !" })
    

        // check product exist or not;
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        //console.log(product)
        if (!product) return res.status(404).send({ status: false, Message: " productId not found!" })

        // check if the cart is already exist or not
        const cart = await cartModel.findOne({ userId })
        if (cart) {
            // validate cartID
            if (validate.isEmptyVar(cartId)) return res.status(400).send({ status: false, Message: " Cart Id is required!" })
            if (!validate.isValidObjectId(cartId)) return res.status(400).send({ status: false, Message: " cart Id is not Valid!" })
            // check both cartid's from req.body and db cart are match or not?
            if (cart._id != cartId) 
            return res.status(400).send({ status: false, Message: " CartId does't belong to this user!" })
           

          
            // we neeed to check if the item already exist in my item's list or NOT!!
            let index = -1;
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    index = i
                    break
                }
            }

            // now we need to add item
            if (index >= 0) {
                cart.items[index].quantity = cart.items[index].quantity + quantity
            } else {
                cart.items.push({ productId, quantity })
            }

            // update price
            let total = cart.totalPrice + (product.price * quantity)
            cart.totalPrice = Math.round(total * 100) / 100
            // update quantity
            cart.totalItems = cart.items.length
            // update cart
            await cart.save()
            return res.status(201).send({ status: true, Message: " Item added successfully and Cart updated!" })
           
        }

        // round OFF total
        let total = product.price * quantity
        total = Math.round(total * 100) / 100

        // need to create new cart here 
        const object = {
            userId,
            items: [{ productId, quantity }],
            totalPrice: total,
            totalItems: 1
        }

        const createCart = await cartModel.create(object)
        return res.status(201).send({ status: true, Message: "Item added successfully in the  New cart created!" })
       

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


module.exports={create}