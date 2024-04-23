// [SECTION] Dependencies and Modules
// The "Product" variable is defined using a capitalized letter to indicate that what we are using is the "Product" model for code readability
const Product = require("../models/Product.js");

//[SECTION] Product Creation
module.exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    // Check if required fields are present
    if (!name || !description || !price || !stock) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if price is a valid number
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Price must be a valid positive number" });
    }

      // Check if stock is a valid number
    if (isNaN(stock) || stock <= 0) {
      return res.status(400).json({ error: "Stock must be a valid positive number" });
    }

    // Check if product with the provided name (case insensitive) already exists
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });
    if (existingProduct) {
      return res.status(400).json({ error: "Product already exists" });
    }

    // Create a new product
    let newProduct = new Product({
      name: name,
      description: description,
      price: price,
      inventoryStock: stock,
    });
    
    // Save the product
   return newProduct
      .save()
      .then((product) =>
        res
          .status(201)
          .send({ message: "The product was created Successfully", product })
      )
      .catch((err) => {
        console.error("Error in saving: ", err);
        return res.status(500).send({ error: "Error in save" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// [SECTION] Get all products
module.exports.getAllProducts = (req, res) => {
  // Find all products in the database
  Product.find({})
    .then(products => {
      // Check if any products are found
      if (products.length > 0) {
        // If products are found, return them with a success status code
        return res.status(200).json({ products });
      } else {
        // If no products are found, return a message with a success status code
        return res.status(200).json({ message: "No products found at the moment." });
      }
    })
    .catch(error => {
      // Handle any errors that occur during the database query
      console.error("Error in finding all products:", error);
      // Return an error response with a 500 status code
      return res.status(500).json({ error: "Error finding products" });
    });
};



// [SECTION] Get all active products
module.exports.getAllActive = (req, res) => {
  try {
    // Use try-catch block to handle potential errors
    return Product.find({ isActive: true }) // Find all products with isActive set to true
      .then((products) => {
        // If products are found, return the products with a success status code
        if (products.length > 0) {
          return res.status(200).json({ products });
        } else {
          // If no active products are found, return a message with a success status code
          return res
            .status(200)
            .json({ message: "There are no active products at the moment." });
        }
      })
      .catch((err) => {
        // Handle any errors that occur during the database query
        console.error("Error in finding active products: ", err);
        return res
          .status(500)
          .json({ error: "Error in finding active products." });
      });
  } catch (error) {
    // Catch any synchronous errors that occur outside of the promise chain
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// [SECTION] Get a single product via params
module.exports.getProduct = async (req, res) => {
  // Extract productId from request parameters
  const productId = req.params.productId;
  try {
    // Attempt to find the product by its ID in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "The product does not exist." });
    }
    return res.status(200).json({ product });
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error in fetching the product: ", error);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};

// [SECTION] Get a single product and update via params
module.exports.updateProduct = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  // Check if productId and userId are provided
  if (!productId || !userId) {
    return res.status(400).json({ error: "Both productId and userId are required fields." });
  }

  try {
    const { name, description, price, stock } = req.body;

    // Check if at least one field among name, description, price, and stock is updated
    if (!name && !description && !price && !stock) {
      return res.status(400).json({ error: "At least one field among name, description, price, and stock must be updated." });
    }

    // Construct the updatedProduct object with only the provided fields
    const updatedProduct = {};
    if (name) updatedProduct.name = name;
    if (description) updatedProduct.description = description;
    if (price) updatedProduct.price = price;
    if (stock) updatedProduct.inventoryStock = stock;

    // Find and update the product in the database
    const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });

    // If product is found and updated, return success response
    if (product) {
      return res.status(200).json({
        message: "The product is updated successfully",
        updatedProduct: product,
      });
    } else {
      // If product does not exist, return 404 error response
      return res.status(404).json({ message: "The product does not exist." });
    }
  } catch (error) {
    console.error("Error in updating a product: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


//[SECTION] Archive a single product via params
module.exports.archivedProduct = async (req, res) => {
  try {
    // Find the product by its ID
    const product = await Product.findById(req.params.productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).send({ message: "The product does not exist." });
    }

    // Check if the product is already archived
    if (!product.isActive) {
      return res
        .status(400)
        .send({ message: "The product has already been archived." });
    }

    // Update the product's isActive field to false to archive it
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      { isActive: false },
      { new: true }
    );

    // Return success response with details of the archived product
    return res.status(200).send({
      name: updatedProduct.name,
      message: "Product archived successfully",
      archivedProduct: updatedProduct,
    });
  } catch (err) {
    // Handle errors that occur during the process
    console.error("Error in archiving a product: ", err);
    return res.status(500).send({ error: "Failed to archive product." });
  }
};


//[SECTION] Activate a single product via params
module.exports.activateProduct = async (req, res) => {
  try {
    // Find the product by its ID
    const product = await Product.findById(req.params.productId);
    
    // Check if the product exists
    if (!product) {
      return res.status(404).send({ message: "The product does not exist." });
    }
    
    // Check if the product is already active
    if (product.isActive) {
      return res.status(400).send({ message: "The product has already been activated." });
    }
    
    // Activate the product by updating isActive field to true
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      { isActive: true },
      { new: true }
    );
    
    // Return success response with details of the activated product
    return res.status(200).send({
      name: updatedProduct.name,
      message: "Product activated successfully",
      activateProduct: updatedProduct,
    });
  } catch (err) {
    // Handle errors that occur during the process
    console.error("Error in activating a product: ", err);
    return res.status(500).send({ error: "Failed to activate the product." });
  }
};



//[SECTION] Search a single item in the list via body( productName)
module.exports.searchByName = async (req, res) => {
  // Extract the productName from the request body
  const { productName } = req.body;

  try {
    // Input validation: check if productName is provided and is a string
    if (!productName || typeof productName !== "string") {
      return res.status(400).json({ error: "Invalid productName" });
    }

    // Search for a product with a name containing the provided productName (case-insensitive)
    const product = await Product.findOne({
      name: { $regex: productName, $options: "i" },
    });

    // If no product is found, return a 404 error
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If a product is found, return it with a success message
    return res.status(200).json({
      message: "Product found successfully",
      product: product,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error in searching for product: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


//[SECTION] Search items within the list via body(minPrice,maxPrice)
module.exports.searchByPrice = async (req, res) => {
  // Extract minPrice and maxPrice from the request body
  let { minPrice, maxPrice } = req.body;

  try {
    // Input validation: Check if minPrice and maxPrice are provided and are valid numbers
    if (minPrice < 0 || maxPrice < 0 || isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({ error: "Please provide valid minimum and maximum price values" });
    }

    // Convert minPrice and maxPrice to float values
    minPrice = parseFloat(minPrice);
    maxPrice = parseFloat(maxPrice);

    // Define the query arguments to find products within the price range
    const queryArgs = {
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    };

    // Find products matching the query arguments
    const products = await Product.find(queryArgs);

    // If no products are found within the price range, return a 404 error
    if (!products.length) {
      return res.status(404).json({ message: "No products found within the price range" });
    }

    // If products are found within the price range, return them with a success message
    return res.status(200).json({
      message: "Products available",
      products: products,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error in searching products by price:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
