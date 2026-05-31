// require("dotenv").config({path: "./.env"}); // This is the CommonJS syntax for loading environment variables from a .env file.
import dotenv from "dotenv";  // This is the ES6 module syntax for loading environment variables from a .env file. in package.json, we have set "type": "module", so we can use ES6 module syntax in our code.  and in sctipts in package.json, we have set "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js", 
dotenv.config({path: "./.env"});  

// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";

import { app } from "./app.js";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js";



connectDB()     // calling the function to connect to the database and here we are using .then() and .catch() to handle the promise returned by the connectDB function (asynchronous task)
.then(() => {
    app.on("error", (error) => {
        logger.error(`Error: ${error}`);
        throw error;
    }); 
    app.listen(process.env.PORT || 8000, () => {
        logger.info(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    logger.error(`Error connecting to MongoDB: ${err}`);
    process.exit(1);
} )













/*
================ First approach to connect to MongoDB and start the server =================

import express from "express";
const app = express();
;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (err) => {
      console.error("Error starting the server:", err);
      throw err;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
})();

*/
