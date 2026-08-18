const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        isGroup: {
            type: Boolean,
            default: false
        },

        groupName: {
            type: String,
            trim: true,
            default: ""
        },

        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Chat", ChatSchema);