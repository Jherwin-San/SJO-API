// [SECTION] Dependencies and Modules
const express = require("express");
const cartController = require("../controllers/cart.js");
const auth = require("../auth.js");
const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router = express.Router();

// [SECTION] Routes

// GET /cart - Get user's cart
router.get("/", verify, cartController.getUserCart);

// POST /cart/addToCart - Add item(s) to cart
router.post("/addToCart", verify,  async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    if (Array.isArray(cartItems)) {
      await cartController.addToCartMultipleItems(req, res);
    } else {
      await cartController.addToCart(req, res);
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /cart/updateQuantity - Update item quantity in cart
router.patch("/updateQuantity", cartController.updateQuantity);

// DELETE /cart/:productId/removeFromCart - Remove item from cart
router.delete("/:productId/removeFromCart", cartController.removeFromCart);

// DELETE /cart/clearCart - Clear user's cart
router.delete("/clearCart", cartController.clearCart);

module.exports = router;
