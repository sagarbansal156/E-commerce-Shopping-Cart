<<<<<<< HEAD
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, quantity: { type: Number, required: true, min: 1 } }],

    totalPrice: { type: Number, required: true },

    totalItems: { type: Number, required: true },

    totalQuantity: { type: Number, required: true },

    cancellable: { type: Boolean, default: true },

    status: { type: String, default: 'pending', enum: ["pending", "completed", "canceled"] },

    deletedAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },

}, { timestamps: true });

=======
const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, quantity: { type: Number, required: true, min: 1 } }],
    totalPrice: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    cancellable: { type: Boolean, default: true },
    status: { type: String, default: 'pending', enum: ["pending", "completed", "cancelled"] },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true });

>>>>>>> 9a170a0bf8c73346a961a0fa3cccb6849b3bd654
module.exports = mongoose.model('Order', orderSchema)