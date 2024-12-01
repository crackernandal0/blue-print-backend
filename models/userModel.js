const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please add a firstname"],
    },
    isadmin: {
      type: Boolean,
      //   required: [true, "Please add a admin"],
    },
    image: {
      type: String,
      //   required: [true, "Please add a admin"],
    },
    lastname: {
      type: String,
      required: [true, "Please add a lastname"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    number: {
      type: String,
      required: [true, "Please add a number"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
