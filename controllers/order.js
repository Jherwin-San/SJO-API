// [SECTION] Dependencies and Modules
// The "Order" variable is defined using a capitalized letter to indicate that what we are using is the "Order" model for code readability
const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const User = require("../models/User.js");
const emailService = require('../services/emailService');

//[SECTION] Create the User's Order  that is saved on token
module.exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Input validation
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    if (req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access is not allowed" });
    }
    
    // Find the cart for the given user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    
    const { cartItems, totalPrice } = cart;

    // Check if cartItems is empty
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "No items in cart yet" });
    }

    // Find the user's email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { email } = user;

    // Create an orderedProducts object
    const orderedProducts = new Order({
      userId,
      productsOrdered: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      totalPrice: totalPrice,
    });

    // Save the orderedProducts to the database
    const checkout = await orderedProducts.save();

    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();
    
    // Send a confirmation email to the user
    await emailService.sendOrderConfirmationMail(email);

    res.status(201).json({ message: "Order created successfully", checkout });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//[SECTION] Retrieve all orders by Admin with token
module.exports.retrievedByAdmin = async (req, res) => {
  try {
    // Validate user object
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access is required" });
    }
    
    // Retrieve all orders
    const orders = await Order.find({});

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    
    // Return orders along with a success message
    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    // Log detailed error information
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//[SECTION] Retrieve all orders by an Authenticated User that is saved on token
module.exports.retrievedByAuthUser = async (req, res) => {
  const userId = req.user.id;
  
  try {    
    // Input validation
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    //Input validation
    if (req.user.isAdmin) {
      return res.status(403).send({ message: "Admin Access is Not Allowed" });
    } else {
    // Retrieve orders for the authenticated user
      const orders = await Order.find({ userId });

      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: "No orders found" });
      }

    // Return orders along with a success message
      res.status(200).json({ message: "Orders retrieved successfully", orders });
    }} catch (error) {
      console.error("Error retrieving orders:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};
