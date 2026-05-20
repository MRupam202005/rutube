import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });          // validateBeforeSave: false is used to bypass the validation of the model (like password length, email format, etc) when saving the user (because we are not sending the password and refresh token from the frontend)

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // added by middleware
    let coverImageLocalPath = "";
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {   // just checking for the first element is enough for us
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }


    // Upload avatar and coverImage to cloudinary  
    const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudinary = await uploadOnCloudinary(coverImageLocalPath);


    if (!avatarCloudinary) {
        throw new ApiError(401, "Something went wrong while uploading the avatar")
    }
    if (!coverImageCloudinary) {
        throw new ApiError(401, "Something went wrong while uploading the cover image")
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
    /*
        Steps : 
        1. Get the user data from frontend (username or email and password)
        2. Validate the user data
        3. Check if the user exists: Using email or username
        4. If user not found: throw error
        5. Compare the password
        6. Generate the access token and refresh token 
        7. send the response in the form of 🍪cookies (only 200 code) don't send the password and refresh token 
    */


    const { email, username, password } = req.body();
    if (!email || !username || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ $or: [{ email: email }, { username: username }] });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,  // because we don't want to access the cookie from the frontend (XSS attack)
        secure: true,    // because we are using https
        sameSite: "strict", // CSRF(Cross-Site Request Forgery) attack protection
        maxAge: 1000 * 60 * 60 * 24
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200,
            {
                user: loggedInUser,   // If we want to access the user object in frontend we send it, or else we can just send the tokens(but user is still needed for the navbar, etc)
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        ))
})

const logoutUser = asyncHandler(async (req, res) => {

    /*
        Steps : 
        1. Get the user data from frontend (username or email and password)
        2. Validate the user data
        3. Check if the user exists: Using email or username
        4. If user not found: throw error
        5. Compare the password
        6. Generate the access token and refresh token 
        7. send the response in the form of 🍪cookies (only 200 code) don't send the password and refresh token 
    */

    // Update the refresh token in the database to null
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };












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