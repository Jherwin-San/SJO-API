// Dependencies and Modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// Google Login
// const passport = require("passport");
// const session = require("express-session");
// require("./passport");
const cors = require("cors");

// Allows access to routes defined within our application
const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");

// [SECTION] Environment Setup

// [SECTION] Server Setup
// Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
const app = express();
const port =  process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Allows all resources to access our backend application
 app.use(cors());

// Google Login
// app.use(
//   session({
//     secret: process.env.clientSecret,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// Initializes the passport package when the application runs
// app.use(passport.initialize());
// // Creates a session using the passport package
// app.use(passport.session());

// Connect to MongoDB database
mongoose.connect(
  `${process.env.MONGO_URI}`
);

// Prompts a message in the terminal once the connection is "open" and we are able to successfully connect to our database
mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas")
);

// Backend Routes
// Defines the "/users" string to be included for all user routes defined in the "user" route file
// Groups all routes in userRoutes under "/users"
app.use("/b4/users", userRoutes);
app.use("/b4/products", productRoutes);
app.use("/b4/carts", cartRoutes);
app.use("/b4/orders", orderRoutes);

if (require.main === module) {
  app.listen(port, () => console.log(`Server running at ${port}`));
}
module.exports = { app, mongoose };
   