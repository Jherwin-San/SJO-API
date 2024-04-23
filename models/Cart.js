const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"],
  },
  username: {
    type: String,
    required: [true, "User name is required"],
  },
  cartItems: [
    {
      productId: {
        type: String,
        required: [true, "Product ID is required"],
      },
      productName: {
        type: String,
        required: [true, "Product Name is required"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
      },
      subtotal: {
        type: Number,
        required: [true, "Subtotal is required"],
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
  },
  orderedOn: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Cart", cartSchema);
