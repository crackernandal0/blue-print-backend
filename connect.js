// connections.js
const mongoose = require("mongoose");

// Replace with your MongoDB connection string
const uri =
  "mongodb+srv://sagarnandal52:q973M4OObk6PNR2h@cluster0.y7ppq.mongodb.net";

// Function to connect to the database
async function connectToDatabase() {
  try {
    // Connect to the MongoDB cluster
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1); // Exit the process with failure
  }
}

// Call the connect function to establish the connection
connectToDatabase();

// Explicitly export the connection
module.exports = mongoose;
