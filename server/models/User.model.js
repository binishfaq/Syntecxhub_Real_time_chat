const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        profileImage: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: "",
            maxlength: 150
        },

        status: {
            type: String,
            enum: ["online", "offline"],
            default: "offline"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", UserSchema);