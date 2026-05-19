import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const registerUser = asyncHandler(async (req, res) => {
    /*
        Steps : 
        1. Get the user data from frontend(username, email, password, fullName)
        2. Validate the user data
        3. Check if the user already exists: Using username and email
        4. Check for image and avatar then upload them to cloudinary or use default ones
        5. Create the user object
        6. Save the user object to the database
        7. delete the password and refresh token from the user object
        8. Check user actually created or not and accordingly Send the response (don't send the password and refresh token)
    */


    const { username, email, password, fullName } = req.body;
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    } else if (
        !email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
    ) {
        throw new ApiError(400, "Invalid email")
    }

    const userExists = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (userExists) {
        throw new ApiError(409, "User with same username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;  // added by middleware
    const coverImageLocalPath = req.files?.coverImage[0]?.path; // added by middleware

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    // Upload avatar and coverImage to cloudinary  
    const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudinary = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarCloudinary) {
        throw new ApiError(400, "Avatar is required")
    }

    const newUser = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
        fullName: fullName,
        avatar: avatarCloudinary.url,
        coverImage: coverImageCloudinary?.url || "",
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    // send the response (only 201 code)
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "Success"
    })
})



export { registerUser, loginUser };












/*
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "Success"
    })
})

const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "Success"
    })
})
*/