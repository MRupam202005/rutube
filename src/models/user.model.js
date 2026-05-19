import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true               // it means that the username is indexed, so it can be searched faster
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,             //cloudinary url  
            required: true
        },
        coverImage: {
            type: String,
        },
        watchHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Video"                //ref is used for refering another collection (model)
        }],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {                  //it is used for generating new access token 
            type: String,
        }
    },
    { timestamps: true }
)

// Before saving the user, we need to hash the password 
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;                             // if the password is not modified, then we don't need to hash it
    this.password = await bcrypt.hash(this.password, 10);                  // hashing the password
})

// methods
userSchema.methods.isPasswordCorrect = async function (password) {  // it is for : userController.login to check if the password is correct (comparing entered password with the hashed password)
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {   // creating access token using jwt
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,   // this is the secret key which is used to sign the JWT token (it is kept secret) 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY   // this is the expiry time for the JWT token 
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);