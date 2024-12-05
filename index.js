// DECLARE EXPRESS
const express = require("express");
// DECLARE CORS
const cors = require("cors");
// DECLARE API ROUTE FOR AUTHENTICATION
const authRouter = require("./src/routers/authRouter");
// DECLARE CONNECTION TO MONGODB
const connectDB = require("./src/configs/connectDb");
// DECLARE ERROR MIDDLEWARE ROUTING
const errorMiddleware = require("./src/middlewares/errorMiddleware");

// DECLARE APP
const app = express();
// CONFIG THE DOTENV
require("dotenv").config();

// USE THE CORS AND EXPRESS JSON
app.use(cors());
app.use(express.json());

// DECLARE THE PORT FOR THE SERVER
const PORT = 3001;

// USE THE ROUTES FOR AUTHENTICATION
app.use("/auth", authRouter);

// CONNECT TO MONGODB
connectDB();

// USE THE ERROR MIDDLEWARE
app.use(errorMiddleware);

// LISTEN TO THE PORT
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server starting at port: http://localhost:${PORT}`);
});
