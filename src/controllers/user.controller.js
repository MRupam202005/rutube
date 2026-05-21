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


    const { email, username, password } = req.body;
    if (!(email || username) || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
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
        { returnDocument: "after" }
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


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);  // Using the user id from the token, ? mark because there might be a case where the user is not logged in
    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isOldPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
})

// As we added the current user information is the req at the time of login and refresh using the verifyJWT middleware, we can access it here
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
})

// route handlers for updateAccountDetails => Use different handlers for updating any file information , avatar , coverImage
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    const user = await User.findById(req.user?._id);  // Using the user id from the token, ? mark because there might be a case where the user is not logged in
    if (!(fullName && email)) {
        throw new ApiError(400, "All fields are required");
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { returnDocument: "after" }
    ).select("-password ");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User account details updated successfully"));
})


// Route handler for changeProfilePicture
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0].path;  // Files are always sent as files and they are available in req because of multer middleware

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath);  // Upload the file to the cloud
    if (!avatarCloudinary) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to update user avatar"));
    }

    const user = await User.findById(req.user?._id).select("-password");  // Using the user id from the token, ? mark because there might be a case where the user is not logged in
    if (user?.avatar) {
        await deleteFromCloudinary(user.avatar);
    }
    // update in database
    user.avatar = avatarCloudinary.url;
    await user.save({ validateBeforeSave: false });
    // return response  

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User avatar updated successfully"));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.coverImage[0].path;  // Files are always sent as files and they are available in req because of multer middleware

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }
    const coverImageCloudinary = await uploadOnCloudinary(coverImageLocalPath);  // Upload the file to the cloud
    if (!coverImageCloudinary) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to update user cover image"));
    }
    const user = await User.findById(req.user?._id).select("-password");  // Using the user id from the token, ? mark because there might be a case where the user is not logged in
    if (user?.coverImage) {
        await deleteFromCloudinary(user.coverImage);
    }
    user.coverImage = coverImageCloudinary.url;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User cover image updated successfully"));
})

// Route handler for getUserChannelProfile
const getUserChannelProfile = asyncHandler(async (req, res) => {
    // fetch the username from the params
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    // populate the video and subscriber count using User.aggregate and Subscriber.aggregate
    const channelProfile = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
            }
        }
    ])

    if (!channelProfile?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channelProfile[0], "Channel profile fetched successfully"));
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage };












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