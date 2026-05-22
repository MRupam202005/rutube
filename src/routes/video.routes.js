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

// Apply verifyJWT middleware to all routes in this file
// Every route below this line requires the user to be logged in!
router.use(verifyJWT);

// Root routes (/api/v1/videos/)
router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([ 
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishVideo
    );

// Parameterized routes (/api/v1/videos/:videoId)
router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo); // Expects the field name "thumbnail" if updating the image

// Toggle Publish Status Route (/api/v1/videos/toggle/publish/:videoId)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;