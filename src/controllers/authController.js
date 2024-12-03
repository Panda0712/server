const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const getJsonWebtoken = async (email, id) => {
  const payload = {
    email,
    id,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });

  return token;
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    res.status(401);
    throw new Error("User has already been registered");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res.status(200).json({
    message: "Register successfully",
    data: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      accessToken: await getJsonWebtoken(email, newUser.id),
    },
  });
});

module.exports = {
  register,
};
