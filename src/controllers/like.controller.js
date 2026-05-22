import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Toggle video like
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const like = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (like) {
        // If it exists, user is un-liking the video
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed from video"));
    } else {
        // If it doesn't exist, user is liking the video
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        });
        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Video liked successfully"));
    }
})


// Toggle comment like
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const like = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed from comment"));
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });
        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Comment liked successfully"));
    }
})


// Toggle tweet like
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const like = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed from tweet"));
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });
        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Tweet liked successfully"));
    }
}
)


// Get liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    // We want to fetch all videos the current user has liked
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null } // Only get likes that are attached to a video
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
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
                ]
            }
        },
        {
            $addFields: {
                videoDetails: { $first: "$videoDetails" }
            }
        },
        {
            $project: {
                videoDetails: 1,
                createdAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
