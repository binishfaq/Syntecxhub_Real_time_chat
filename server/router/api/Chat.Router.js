const express = require("express");
const router = express.Router();

const Chat = require("../../models/Chat.model");
const User = require("../../models/User.model");
const auth = require("../../middleware/auth");


// CREATE PRIVATE CHAT
router.post("/", auth, async (req, res) => {
    const { userId } = req.body;

    try {
        // Check userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                msg: "User ID is required"
            });
        }

        // Check if other user exists
        const otherUser = await User.findById(userId);

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // Prevent chatting with yourself
        if (req.user.id === userId) {
            return res.status(400).json({
                success: false,
                msg: "You cannot create a chat with yourself"
            });
        }

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            isGroup: false,
            participants: {
                $all: [req.user.id, userId],
                $size: 2
            }
        });

        if (existingChat) {
            return res.status(200).json({
                success: true,
                msg: "Chat already exists",
                chat: existingChat
            });
        }

        // Create new chat
        const chat = new Chat({
            participants: [
                req.user.id,
                userId
            ],
            isGroup: false
        });

        await chat.save();

        // Populate users
        await chat.populate(
            "participants",
            "-password"
        );

        res.status(201).json({
            success: true,
            msg: "Chat created successfully",
            chat
        });

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
});



router.get("/", auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        })
        .populate("participants", "-password")
        .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            chats
        });

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
});

module.exports = router;