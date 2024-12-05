const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

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

const handleSendVerificationEmail = async (val, email) => {
  try {
    await transporter.sendMail({
      from: `EventHub Support <${process.env.USER_EMAIL}>`,
      to: email,
      subject: "Verification Email",
      text: "Your verification code",
      html: `<h1>${val}</h1>`,
    });

    return "OK";
  } catch (error) {
    return error;
  }
};

const verification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const verificationCode = Math.round(1000 + Math.random() * 9000);

  try {
    await handleSendVerificationEmail(verificationCode, email);

    res.status(200).json({
      message: "Verification email sent successfully",
      data: { code: verificationCode },
    });
  } catch (error) {
    res.status(401);
    throw new Error("Failed to send verification email");
  }
});

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

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await UserModel.findOne({
    email,
  });

  if (!existingUser) {
    res.status(403).json({
      message: "User not found!!!",
    });
    throw new Error("Invalid credentials");
  }

  const isMatchPassword = await bcrypt.compare(password, existingUser.password);

  if (!isMatchPassword) {
    res.status(401);
    throw new Error("Email or Password do not match");
  }

  res.status(200).json({
    message: "Login successfully",
    data: {
      id: existingUser.id,
      email: existingUser.email,
      accessToken: await getJsonWebtoken(email, existingUser.id),
    },
  });
});

module.exports = {
  register,
  login,
  verification,
  handleSendVerificationEmail,
};
