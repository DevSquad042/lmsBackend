import mongoose from "mongoose";
import { type } from "os";
import { boolean } from "webidl-conversions";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true, 
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6

    },
    role: {
        type: String,
        enum: ["admin", "instructor", "user"],
        default: "user"
    },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    verified:{
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },
    verificationExpires: Date,
    resetToken: {
        type: String,
    },
    resetTokenExpires: Date,
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },


}, {timestamps: true})


const User = mongoose.model("User", userSchema)
export default User;