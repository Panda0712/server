// IMPORT USER MODEL
const UserModel = require("../models/userModel");
// IMPORT BCRYPT
const bcrypt = require("bcrypt");
// IMPORT ASYNC HANDLER
const asyncHandler = require("express-async-handler");
// IMPORT JSON WEB TOKEN
const jwt = require("jsonwebtoken");
// IMPORT NODEMAILER
const nodemailer = require("nodemailer");
// CONFIG DOTENV
require("dotenv").config();

// DEFINE THE TRANSPORTATION FOR SENDING EMAIL
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

// HANDLE LOGIC FOR GETTING THE JSON WEB TOKEN
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

// HANDLE LOGIC FOR SENDING VERIFICATION EMAIL
const handleSendVerificationEmail = async (val) => {
  try {
    await transporter.sendMail(val);

    return "OK";
  } catch (error) {
    return error;
  }
};

// HANDLE VERIFICATION LOGIC
const verification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const verificationCode = Math.round(1000 + Math.random() * 9000);

  try {
    const data = {
      from: `EventHub Support <${process.env.USER_EMAIL}>`,
      to: email,
      subject: "Verification Email",
      text: "Your verification code",
      html: `<h1>${verificationCode}</h1>`,
    };

    await handleSendVerificationEmail(data);

    res.status(200).json({
      message: "Verification email sent successfully",
      data: { code: verificationCode },
    });
  } catch (error) {
    res.status(401);
    throw new Error("Failed to send verification email");
  }
});

// HANDLE LOGIC FOR REGISTERING USER
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

// HANDLE LOGIC FOR LOGIN USER
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

// HANDLE LOGIC FOR FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const randomPassword = Math.round(100000 + Math.random() * 99000);

  const data = {
    from: `New password <${process.env.USER_EMAIL}>`,
    to: email,
    subject: "Verification Email",
    text: "Your forgot password email",
    html: `<h1>${randomPassword}</h1>`,
  };

  const existingUser = await UserModel.findOne({
    email,
  });

  if (existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword.toString(), salt);

    await UserModel.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      isChangePassword: true,
    });

    await handleSendVerificationEmail(data)
      .then(() => {
        res.status(200).json({
          message: "Verification password sent successfully",
          data: [],
        });
      })
      .catch((err) => {
        res.status(401);
        throw new Error("Failed to send forgot password email");
      });
  } else {
    res.status(401);
    throw new Error("User not found!!!");
  }
});

module.exports = {
  register,
  login,
  verification,
  handleSendVerificationEmail,
  forgotPassword,
};
