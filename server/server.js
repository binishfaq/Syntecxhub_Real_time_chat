const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const chalk = require('chalk')
const DBconnect = require('./db/Db')
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.get('/', (req, res)=>{
    res.status(200).json({success: true, msg:"SyncChat Backend is Running"})
})

DBconnect();

app.use('/api/register', require('./router/api/Register.Router'));
app.use('/api/login', require('./router/api/Login.Router'));
app.use('/api/users', require('./router/api/User.Router'));

app.listen(PORT, () => {
    console.log(
        chalk.blue("✓ SyncChat server running") +
        chalk.gray(` → http://localhost:${PORT}`)
    );
});