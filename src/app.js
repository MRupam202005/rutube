import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import logger from "./utils/logger.js";

const app = express();

// 1. Helmet: Secures Express apps by setting HTTP response headers.
// It mitigates common web vulnerabilities like XSS, clickjacking, etc.
app.use(helmet());

// 4. HTTP Request Logging using Morgan and Winston
// Morgan automatically logs all incoming HTTP requests (like GET /videos), 
// and we pipe it into Winston so it gets written to our log files.
app.use(morgan("combined", { stream: logger.stream }));

// configuring cors (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// 2. Rate Limiting: Limits repeated requests to public APIs and/or endpoints
// This prevents brute-force attacks and DDoS (Distributed Denial of Service).
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 500, // Limit each IP to 500 requests per window
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter); // apply to API routes only

// configuring express to accept JSON data in requests
app.use(express.json({limit: "16kb"}));

// configuring express to accept URL-encoded data in requests
app.use(express.urlencoded({extended: true}));

// 3. Mongo Sanitize: Sanitizes user-supplied data to prevent MongoDB Operator Injection
// It removes any keys starting with '$' or '.' from req.body, req.query, or req.params
app.use(mongoSanitize());

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