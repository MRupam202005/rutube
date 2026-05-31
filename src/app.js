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



// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

// Global Error Handler Middleware (So that the frontend actually know which error has occurred in the backend)
app.use((err, req, res, next) => {
    // checking if the error is already an instance of ApiError (defined in utils/ApiError.js)
    const statusCode = err.statusCode || 500;
    // setting the message to be sent to the frontend
    const message = err.message || "Internal Server Error";
    // sending the response to the frontend
    return res.status(statusCode).json({
        success: false, // indicating that an error has occurred
        message: message, // the error message
        errors: err.errors || [] // including errors array if present
    });
});

export {app};