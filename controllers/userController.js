const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//@desc Register new user
//@route GET /api/users/register
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, number, admin } = req.body;
  if (!firstname || !email || !password || !lastname || !number) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered");
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstname,
    lastname,
    email,
    number,
    password: hashedPassword,
    admin: admin === true,
  });
  console.log(`New user created: ${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, user: user });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
  res.json({ message: "Register the user" });
});

//@desc User login
//@route GET /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const user = await User.findOne({ email });
  console.log("New login:", user);
  //Compare password with hashed password
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" } // expiry time
    );
    res.status(200).json({ accessToken, user });
  } else {
    res.status(401);
    throw new Error("Email or password is not valid");
  }
});

//@desc Current user ifno
//@route GET /api/users/current
//@access Private
const currentUser = asyncHandler(async (req, res) => {
  console.log("Current user:", req.user);
  res.json(req.user);
});

//@desc Get all users
//@route GET /api/users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const editUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, number, password, admin, image } = req.body;

  // Find the user
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Handle image upload to Cloudinary if an image is provided
  let imageUrl = user.image; // Default to existing image
  if (image) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: "user_profiles",
      });
      imageUrl = result.secure_url; // Get the secure URL of the uploaded image
    } catch (error) {
      res.status(500);
      throw new Error("Image upload failed");
    }
  }

  // Update fields
  if (firstname) user.firstname = firstname;
  if (lastname) user.lastname = lastname;
  if (email) user.email = email;
  if (number) user.number = number;
  if (password) user.password = await bcrypt.hash(password, 10); // Hash new password
  if (admin !== undefined) user.admin = admin === "true";
  user.image = imageUrl; // Update image URL

  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
});

module.exports = {
  editUser,
  registerUser,
  loginUser,
  currentUser,
  getAllUsers,
};

// module.exports.upload = upload.single("image");
