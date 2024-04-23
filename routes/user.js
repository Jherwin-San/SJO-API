// [SECTION] Dependencies and Modules
const express = require("express");
const userController = require("../controllers/user.js");
const auth = require("../auth.js");
const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router = express.Router();

// [SECTION] Routes

// POST /users - Register a new user
router.post("/", userController.registerUser);

// POST /users/login - User login
router.post("/login", userController.loginUser);

// get /users/details - Get user profile details
router.get("/details", verify, userController.getProfile);

// PUT /users/set-as-admin - Set user as admin
router.put("/set-as-admin", verify, verifyAdmin, userController.updateUserAsAdmin);

// PUT /users/update-password - Update user password
router.put("/update-password", verify, userController.updatePassword);

// DELETE /users/:userId/archived - Delete user
router.delete("/:userId/archived", verify, verifyAdmin, userController.deleteUser);

// GET /users/all - Get all users
router.get("/all", verify, verifyAdmin, userController.getAllUsers);

module.exports = router;
