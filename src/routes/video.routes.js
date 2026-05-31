import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";

const router = Router();

// Root routes (/api/v1/videos/)
router
    .route("/")
    .get(getAllVideos) // Publicly accessible
    .post(
        verifyJWT, // Protected
        upload.fields([ 
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishVideo
    );

// Parameterized routes (/api/v1/videos/:videoId)
router
    .route("/:videoId")
    .get(getVideoById) // Publicly accessible
    .delete(verifyJWT, deleteVideo) // Protected
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo); // Protected

// Toggle Publish Status Route (/api/v1/videos/toggle/publish/:videoId)
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus); // Protected

export default router;