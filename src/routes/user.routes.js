import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
const router = Router();


// register user
router.route("/register").post(
    upload.fields([                     // Middleware to handle file upload before controller function is called
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser);

// login user
router.route("/login").post(loginUser);

export default router;