import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscriber } from "../models/subscriber.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Toggle Subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const isSubscribed = await Subscriber.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (isSubscribed) {
        // If already subscribed, unsubscribe
        await Subscriber.findByIdAndDelete(isSubscribed._id);
        return res.status(200).json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        // If not subscribed, subscribe
        await Subscriber.create({
            subscriber: req.user._id,
            channel: channelId
        });
        return res.status(200).json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
    }
})

// Return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscriber.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
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
                subscriberDetails: { $first: "$subscriberDetails" }
            }
        },
        {
            $project: {
                subscriberDetails: 1,
                createdAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
})

// Return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscriber.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
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
                channelDetails: { $first: "$channelDetails" }
            }
        },
        {
            $project: {
                channelDetails: 1,
                createdAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
