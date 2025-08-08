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
        unique: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
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

}, {timestamps: true})


const User = mongoose.model("User", userSchema)
export default User;