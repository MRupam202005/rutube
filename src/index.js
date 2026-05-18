// require("dotenv").config({path: "./.env"}); // This is the CommonJS syntax for loading environment variables from a .env file.
import dotenv from "dotenv";  // This is the ES6 module syntax for loading environment variables from a .env file. in package.json, we have set "type": "module", so we can use ES6 module syntax in our code.  and in sctipts in package.json, we have set "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js", 
dotenv.config({path: "./.env"});  

import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";


import connectDB from "./db/index.js";



connectDB()













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
