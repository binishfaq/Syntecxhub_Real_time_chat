const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const User = require('./models/User.model')

require("dotenv").config();

const cors = require("cors");
const chalk = require("chalk");

const DBconnect = require("./db/Db");

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.use((socket, next) => {

    try {

        const token = socket.handshake.auth.token;

        if (!token) {
            return next(
                new Error("Authentication token required")
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.userId = decoded.user.id;

        next();

    } catch (err) {

        console.error(
            "Socket authentication failed:",
            err.message
        );

        next(new Error("Invalid token"));
    }
});


// ===============================
// SOCKET CONNECTION
// ===============================

io.on("connection", async (socket) => {


    socket.on("send_message", async (data) => {

        try {

            const { chatId, content } = data;

            if (!chatId || !content) {

                return socket.emit("message_error", {
                    success: false,
                    msg: "Chat ID and message content are required"
                });

            }

            const message = new Message({
                chat: chatId,
                sender: socket.userId,
                content,
                messageType: "text",
                readBy: [socket.userId]
            });

            await message.save();

            const populatedMessage = await Message
                .findById(message._id)
                .populate("sender", "username email profileImage");

            io.to(chatId).emit(
                "receive_message",
                populatedMessage
            );

            console.log(
                chalk.green("✓ Message sent in chat: ") +
                chalk.yellow(chatId)
            );

        } catch (err) {

            console.error(
                "Message error:",
                err.message
            );

            socket.emit("message_error", {
                success: false,
                msg: "Failed to send message"
            });

        }

    });

    console.log("🔥 CONNECTION HANDLER ACTIVE");

    socket.on("join_chat", (chatId) => {

        console.log("🔥 JOIN_CHAT RECEIVED");
        console.log("Chat ID:", chatId);

        socket.join(chatId);

        console.log("✓ User joined chat:", chatId);

        console.log("Rooms:", [...socket.rooms]);

    });
    console.log(
        chalk.green("✓ Socket connected: ") +
        chalk.yellow(socket.id)
    );

    console.log(
        chalk.blue("User ID: ") +
        chalk.yellow(socket.userId)
    );


    // USER ONLINE
    try {

        await User.findByIdAndUpdate(
            socket.userId,
            {
                status: "online"
            }
        );

        console.log(
            chalk.green("✓ User is now online")
        );

    } catch (err) {

        console.error(
            "Failed to update online status:",
            err.message
        );

    }


    // JOIN CHAT ROOM
    socket.on("join_chat", (chatId) => {

        console.log("📥 join_chat event received");
        console.log("Chat ID:", chatId);

        socket.join(chatId);

        console.log("✓ User joined chat:", chatId);

        console.log(
            "Rooms:",
            [...socket.rooms]
        );

    });

    // DISCONNECT
    socket.on("disconnect", async () => {

        console.log(
            chalk.red("✗ Socket disconnected: ") +
            chalk.yellow(socket.id)
        );

        try {

            await User.findByIdAndUpdate(
                socket.userId,
                {
                    status: "offline"
                }
            );

            console.log(
                chalk.gray("✓ User is now offline")
            );

        } catch (err) {

            console.error(
                "Failed to update offline status:",
                err.message
            );

        }

    });

});


// ===============================
// PORT
// ===============================

const PORT = process.env.PORT || 5000;


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        msg: "SyncChat Backend is Running"
    });

});


// ===============================
// DATABASE
// ===============================

DBconnect();


// ===============================
// REST API ROUTES
// ===============================

app.use(
    "/api/register",
    require("./router/api/Register.Router")
);

app.use(
    "/api/login",
    require("./router/api/Login.Router")
);

app.use(
    "/api/users",
    require("./router/api/User.Router")
);

app.use(
    "/api/chats",
    require("./router/api/Chat.Router")
);

app.use(
    "/api/messages",
    require("./router/api/Message.Router")
);


// ===============================
// START SERVER
// ===============================

server.listen(PORT, () => {

    console.log(
        chalk.blue("✓ SyncChat server running") +
        chalk.gray(` → http://localhost:${PORT}`)
    );

});