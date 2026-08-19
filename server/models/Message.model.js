const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        messageType: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text"
        },

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Message", MessageSchema);