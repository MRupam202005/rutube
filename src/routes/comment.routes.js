import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT); // Secure all routes

// GET comments of a video, POST new comment
router.route("/:videoId")
    .get(getVideoComments)   // fetching all comments of a specific video
    .post(addComment);       // creating a new comment for a specific video

// DELETE a comment, UPDATE a comment
router.route("/c/:commentId")
    .delete(deleteComment)   // deleting a specific comment
    .patch(updateComment);   // updating a specific comment

export default router;
