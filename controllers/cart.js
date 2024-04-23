// [SECTION] Dependencies and Modules
// The "Cart" variable is defined using a capitalized letter to indicate that what we are using is the "Cart" model for code readability
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");

//[SECTION] Retrieved the User's Cart
module.exports.getUserCart = (req, res) => {
  const userId = req.user.id;
  
  try {
    return Cart.find({ userId })
      .then((userCart) => {
        if (userCart.length > 0) {
          return res.status(200).json({ userCart });
        } else {
          return res.status(404).json({
            message: "The user's cart does not exists at the moment.",
          });
        }
      })
      .catch((err) => {
        console.error("Error in finding  the cart", err);

        return res
          .status(500)
          .json({ error: "Error finding the cart of the user " });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//[SECTION] Add an Item to the User's Cart
module.exports.addToCart = async (req, res) => {
  const {productId, quantity } = req.body;
  const userId = req.user.id
  
  try {
    if (req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access is not permissible" });
    }
    // Check if quantity is valid (not 0 or negative)
    if (quantity <= 0 || isNaN(quantity)) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }

    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      userCart = new Cart({
        userId,
        cartItems: [],
        totalPrice: 0,
      });
    }
    let { cartItems } = userCart;
    const productIndex = cartItems.findIndex(
      (item) => item.productId === productId
    );
    // Find the product details
    const product = await Product.findById(productId);

    // If product doesn't exist or is inactive, return an error
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }
    // Calculate subtotal for the product
    let subtotal = product.price * quantity;
    const name = product.name;
    // Check if product exist to only modify the quantity and quality
    if (productIndex !== -1) {
      cartItems[productIndex].name = name;
      cartItems[productIndex].quantity += quantity;
      cartItems[productIndex].subtotal += subtotal;
    } else {
      cartItems.push({
        productId,
        name,
        quantity,
        subtotal,
      });
    }
    userCart.totalPrice += subtotal;
    await userCart.save();
    res
      .status(201)
      .json({ message: "Product added to cart successfully", cart: userCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//[SECTION] Add an multipleItems to the User's Cart ({userId,cartItems:[{productId,quantity},{productId,quantity}]})
module.exports.addToCartMultipleItems = async (req, res) => {
  const { cartItems } = req.body;
  const userId = req.user
  try {
    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      userCart = new Cart({
        userId,
        cartItems: [],
        totalPrice: 0,
      });
    }

    for (const cartItem of cartItems) {
      const { productId, quantity } = cartItem;

      const product = await Product.findById(productId);

      // If product doesn't exist or is inactive, return an error
      if (!product || !product.isActive) {
        return res
          .status(404)
          .json({ message: "Product not found or inactive" });
      }
      
      // Validate quantity
      if (quantity <= 0 || isNaN(quantity)) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
      }

      // Calculate subtotal
      let subtotal = product.price * quantity;
      let { cartItems } = userCart;
      const name = product.name;

      const productIndex = cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (productIndex !== -1) {
        cartItems[productIndex].name = name;
        cartItems[productIndex].quantity += quantity;
        cartItems[productIndex].subtotal += subtotal;
      } else {
        cartItems.push({
          productId,
          name,
          quantity,
          subtotal,
        });
      }
      userCart.totalPrice += subtotal;
    }
    await userCart.save();
    res
      .status(201)
      .json({ message: "Products added to cart successfully", cart: userCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//[SECTION] Updated the quantity of a single product in the User's Cart
module.exports.updateQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // Input validation
    if (!userId || !productId || !quantity || isNaN(quantity)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Find the user's cart
    const userCart = await Cart.findOne({ userId });

    // If user's cart doesn't exist, return an error
    if (!userCart) {
      return res.status(404).json({ message: "User's cart not found" });
    }

    // Find the product in the cartItems array
    const productIndex = userCart.cartItems.findIndex(item => item.productId === productId);

    // If the product is not found in the cart, return an error
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    // Find the product details
    const product = await Product.findById(productId);

    // If product doesn't exist or is inactive, return an error
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }

    // Calculate the new subtotal based on the updated quantity
    const newSubtotal = product.price * quantity;

    // Update the quantity and subtotal in the cartItems array
    userCart.cartItems[productIndex].quantity = quantity;
    userCart.cartItems[productIndex].subtotal = newSubtotal;

    // Update the total price in the user's cart
    userCart.totalPrice = userCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

    // Save the updated cart
    await userCart.save();

    // Respond with success message and updated cart
    res.status(200).json({
      message: "Cart item quantity updated successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//[SECTION] Removed a single product in the User's Cart via params(productId) and body(userId)
module.exports.removeFromCart = async (req, res) => {
  const { userId } = req.body;
  const { productId } = req.params;

  try {
    // Input validation
    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // If user's cart doesn't exist, return an error
    if (!cart) {
      return res.status(404).json({ message: "User's cart not found" });
    }

    // Filter out the product from the cartItems array
    cart.cartItems = cart.cartItems.filter(item => item.productId !== productId);

    // Update the total price in the user's cart
    cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

    // Save the updated cart
    await cart.save();

    // Respond with the updated cart
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


//[SECTION] Removed all items in the User's Cart via body(userId)
module.exports.clearCart = async (req, res) => {
  const { userId } = req.body;

  try {
    // Input validation
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // If user's cart doesn't exist, return an error
    if (!cart) {
      return res.status(404).json({ message: "Cart does not exist" });
    }

    // Clear the cart items and reset total price
    cart.cartItems = [];
    cart.totalPrice = 0;

    // Save the updated cart
    await cart.save();

    // Respond with success message and updated cart
    res.status(200).json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
