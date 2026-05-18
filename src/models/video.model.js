import mongoose, {Schema} from "mongoose";
import mongooseAgregatePaginate from "mongoose-aggregate-paginate-v2"; // this is used for pagination=>find(condition).sort({createdAt: -1}).skip().limit().exec() this is manual but this plugin do it for us


const videoSchema = new Schema(
    {
        videoFile:{
            type: String,        //cloudinary url
            required: true,
        },
        thumbnail:{
            type: String,       //cloudinary url
            required: true,
        },
        title:{
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: true,
        },
        duration:{
            type: Number,
            required: true,
        },
        views:{
            type: Number,
            default: 0,
        },
        isPublished:{
            type: Boolean,
            default: true,
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User" 
        },
    },
    {timestamps: true}
)

// Applying the plugin to our schema => this plugin adds methods to the schema that can be used to paginate the results => 
videoSchema.plugin(mongooseAgregatePaginate)


export const Video = mongoose.model("Video", videoSchema);