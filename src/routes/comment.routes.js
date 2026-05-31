import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

// GET comments of a video, POST new comment
router.route("/:videoId")
    .get(getVideoComments)             // Publicly accessible
    .post(verifyJWT, addComment);      // Requires login

// DELETE a comment, UPDATE a comment
router.route("/c/:commentId")
    .delete(verifyJWT, deleteComment)  // Requires login
    .patch(verifyJWT, updateComment);  // Requires login

export default router;
