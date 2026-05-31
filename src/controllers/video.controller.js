import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// Publish Video Handler
const publishVideo = asyncHandler(async (req, res) => {
    /*
    steps : 
    1. Get the video data from frontend
    2. Validate the video data
    3. Check if the video exists (we do this while creating the video)
    4. Upload the video to cloudinary
    5. Create the video object
    6. Save the video object to the database
    7. Send the response (only 201 code)
    */

    const { title, description } = req.body;


    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    // Check already exists video
    const videoExists = await Video.findOne({ title });
    if (videoExists) {
        throw new ApiError(409, "Video with same title already exists");
    }

    // Get video file and thumbnail from frontend
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    let thumbnailLocalPath = "";
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    // Upload video and thumbnail to cloudinary
    const videoFileCloudinary = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFileCloudinary) {
        throw new ApiError(401, "Something went wrong while uploading the video file");
    }

    if (!thumbnailCloudinary) {
        throw new ApiError(401, "Something went wrong while uploading the thumbnail");
    }

    // Create the video object
    const video = await Video.create({
        title,
        description,
        videoFile: videoFileCloudinary.url,
        thumbnail: thumbnailCloudinary.url,
        duration: videoFileCloudinary.duration || 0,
        owner: req.user._id,     // As the user must be logged in to publish a video, we get the user id from the request object (added by auth middleware)
    })

    // Save the video object to the database
    const createdVideo = await Video.findById(video._id).select("-owner");

    // Don't send the owner id in the response (privacy concern)
    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while creating the video");
    }

    return res.status(201).json(new ApiResponse(200, createdVideo, "Video published successfully"));
})

// Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pipeline = [];

    // 1. Search by query (title or description)
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    // 2. Filter by userId if provided
    if (userId) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // 3. Only fetch published videos
    pipeline.push({
        $match: {
            isPublished: true
        }
    });

    // 4. Sort the results
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } }); // Default latest
    }

    // 5. Lookup to join User details
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$ownerDetails" }
            }
        }
    );

    // Use aggregate paginate plugin
    const aggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const videos = await Video.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
})

// Get Video By Id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;   // params are like /api/v1/videos/:videoId (url parameters)

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$ownerDetails" },
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                likes: 0 // Remove the likes array from the final output to save bandwidth
            }
        }
    ]);

    if (!video?.length) {
        throw new ApiError(404, "Video not found");
    }

    // Increment view count since someone fetched the video to watch it
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    });

    return res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    );
})

// Update Video Handler
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;   // params are like /api/v1/videos/:videoId (url parameters)
    const { title, description } = req.body;  // body are like ?title=new-title&description=new-description (query parameters)

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Security check: only the owner can update the video
    if (video.owner.toString() !== req.user._id.toString()) {   // tostring because one is Object ID and other is string (due to req.user)
        throw new ApiError(403, "You are not authorized to update this video");
    }
 
    // Ensure they provided something to update
    if (!title && !description && !req.file) {
        throw new ApiError(400, "At least one field (title, description, or thumbnail) is required to update");
    }

    let thumbnailUrl = video.thumbnail;

    // If a new thumbnail is provided via Multer
    if (req.file) {
        const thumbnailLocalPath = req.file.path;
        const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);
        
        if (!thumbnailCloudinary) {
            throw new ApiError(500, "Failed to upload new thumbnail");
        }
        
        // Delete old thumbnail
        await deleteFromCloudinary(video.thumbnail);
        
        thumbnailUrl = thumbnailCloudinary.url;
    }

    // Apply the updates
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnailUrl
            }
        },
        { returnDocument: "after" }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
})

// Delete Video Handler
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required for deletion");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Security check: only the owner can delete the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Delete files from Cloudinary
    await deleteFromCloudinary(video.videoFile, "video"); // Must pass "video" resource type!
    await deleteFromCloudinary(video.thumbnail);          // Default is "image"

    // Delete the document
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
})

// Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Security check
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video publish status toggled successfully")
    );
})

export { publishVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
