// [SECTION] Dependencies and Modules
const express = require("express");
const orderController = require("../controllers/order.js");
const auth = require("../auth.js");
const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router = express.Router();

// [SECTION] Routes

// Route for user checkout
router.post("/checkout", verify, orderController.createOrder);

// Route for retrieving all orders (accessible to admins only)
router.get( "/all-orders", verify, verifyAdmin, orderController.retrievedByAdmin);

// Route for retrieving orders of the authenticated user
router.get("/my-orders", verify, orderController.retrievedByAuthUser);

module.exports = router;
