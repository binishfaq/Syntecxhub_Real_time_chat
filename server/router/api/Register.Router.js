const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../../models/User.model');
const {check, ValidationResult} = require('express-validator')
require('dotenv').config();

router.get('/', async (req,res)=>{
    try {
        const users = await User.find();
        if(!users || users.length === 0){
            return res.status(404).json({success: false, msg: "No user found"})
        }
    
        res.status(200).json({success: true, users})
    }
        
     catch (err) {
        console.error(err.message);
        res.status(500).json({success: false, msg: "Server error"})
    }}
)

router.post('/', [

    check('username', "user name is required").not().isEmpty(),
    check('email', "email is required").isEmail(),
    check('password', "Password must be equal to 6 character").isLength({min: 6}),
], async(req, res)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success: false, error: errors.array()})
    }
    const {username, email, password}= req.body;
    try {
        const existinguser= await User.findOne({email, username});
        if(existinguser){
            return res.status(404).json({success: false, msg: "User Already exists"})
        }

        let user= new User({
            username, email, password,
        });

        const Salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, Salt);
        await user.save();

        const payload = {
            user:{
            id:user.id}
        }
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'}, (err, token)=>{
            if(err) throw err;
             res.status(201).json({
                        success: true,
                        msg: "User registered successfully",
                        token
                    });
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({success: false, msg: "Server error"})
    }
})

module.exports= router;