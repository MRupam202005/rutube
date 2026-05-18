import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

// configuring cors (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// configuring express to accept JSON data in requests
app.use(express.json({limit: "16kb"}));

// configuring express to accept URL-encoded data in requests
app.use(express.urlencoded({extended: true}));

// configuring express to serve static files
app.use(express.static("public"));

// configuring express to accept cookies in requests
app.use(cookieParser());

export {app};