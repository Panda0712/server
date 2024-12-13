// IMPORT ROUTER
const Router = require("express");
// IMPORT FUNCTION FROM CONTROLLER
const {
  register,
  login,
  verification,
  forgotPassword,
  handleGoogleSignIn,
} = require("../controllers/authController");

// DECLARE THE AUTH ROUTER
const authRouter = Router();

// DECLARE EACH API FOR EACH CONTROLLER
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verification", verification);
authRouter.post("/forgot", forgotPassword);
authRouter.post("/google-sign-in", handleGoogleSignIn);

module.exports = authRouter;
