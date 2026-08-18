const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports= function(req, res, next){
const token = req.header('token');
if(!token){
    return res.status(401).json({
        success: false, 
        msg: "Token not found: Access Denied"
    })
}
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user= decoded.user;
    next();
} catch (err) {
    console.error(err.message);
        res.status(500).send('Server Error')
}
}