const { io } = require("socket.io-client");
const chalk = require("chalk");


// ===============================
// JWT TOKEN
// ===============================

const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNmE4NDA2ZmYwNzQ3ZjdjYWQ2OTAwMzlhIn0sImlhdCI6MTc4NzEyMzYwMCwiZXhwIjoxNzg3NzI4NDAwfQ.9exRfWlPRLz_qgNkzhP-R74Mi6Q45t1cOU29tsYq_0Y";


// ===============================
// SOCKET CONNECTION
// ===============================

const socket = io("http://localhost:5000", {
    auth: {
        token: token
    }
});


// ===============================
// CONNECT
// ===============================

socket.on("connect", () => {

    console.log(
        chalk.green("✓ Connected to SyncChat Socket.IO")
    );

    console.log(
        chalk.blue("Socket ID: ") +
        chalk.yellow(socket.id)
    );


    const chatId = "6a8555d63650200143dd7531";


    console.log(
        chalk.cyan("→ Sending join_chat event")
    );

    console.log(
        chalk.gray("Chat ID: ") +
        chalk.yellow(chatId)
    );


    socket.emit("join_chat", chatId);

});


// ===============================
// CONNECTION ERROR
// ===============================

socket.on("connect_error", (err) => {

    console.log(
        chalk.red("✗ Socket connection failed:")
    );

    console.log(
        chalk.red(err.message)
    );

});


// ===============================
// DISCONNECT
// ===============================

socket.on("disconnect", () => {

    console.log(
        chalk.red("✗ Disconnected from server")
    );

});


setTimeout(() => {

    const message = {
        chatId: "6a8555d63650200143dd7531",
        content: "Hello from Socket.IO! 🚀"
    };

    console.log(
        chalk.cyan("→ Sending message:")
    );

    console.log(
        chalk.gray(message.content)
    );

    socket.emit("send_message", message);

}, 1000);