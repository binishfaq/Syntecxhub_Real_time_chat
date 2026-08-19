const express = require("express");
const router = express.Router();

const Message = require("../../models/Message.model");
const Chat = require("../../models/Chat.model");
const auth = require("../../middleware/auth");


// SEND MESSAGE
router.post("/", auth, async (req, res) => {
    const { chatId, content, messageType } = req.body;

    try {
        // Check required fields
        if (!chatId) {
            return res.status(400).json({
                success: false,
                msg: "Chat ID is required"
            });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({
                success: false,
                msg: "Message content is required"
            });
        }

        // Check chat exists
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                msg: "Chat not found"
            });
        }

        // Check user is participant
        const isParticipant = chat.participants.some(
            participant =>
                participant.toString() === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                msg: "You are not a participant of this chat"
            });
        }

        // Create message
        const message = new Message({
            chat: chatId,
            sender: req.user.id,
            content: content.trim(),
            messageType: messageType || "text",
            readBy: [req.user.id]
        });

        await message.save();

        // Populate sender
        await message.populate(
            "sender",
            "-password"
        );

        res.status(201).json({
            success: true,
            msg: "Message sent successfully",
            message
        });

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
});



// GET MESSAGES OF A CHAT
router.get("/:chatId", auth, async (req, res) => {
    try {
        const { chatId } = req.params;

        // Check chat exists
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                msg: "Chat not found"
            });
        }

        // Check user is participant
        const isParticipant = chat.participants.some(
            participant =>
                participant.toString() === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                msg: "You are not a participant of this chat"
            });
        }

        // Get messages
        const messages = await Message.find({
            chat: chatId
        })
            .populate("sender", "-password")
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages
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