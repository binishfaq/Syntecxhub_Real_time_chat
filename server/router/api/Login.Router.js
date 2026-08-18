const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const User = require('../../models/User.model');
const bcrypt = require('bcryptjs')
const {check, ValidationResult, validationResult} = require('express-validator')
require('dotenv').config();

router.get('/',async (req, res)=>{
    const {email} = req.query;
    try {
        const finduser = await User.findOne({email}).select('-password');
        if(!finduser){
            return res.status(404).json({
                success: false,
                msg: "User Not Found."
            })
        }
        res.status(200).json({
            success: true,
                finduser
        })
        
    } catch (err) {
        console.error(err.messsage);
         res.status(500).json({
            success: false,
            msg: "Server error"
        })
    }
})


router.post('/',[
    check('email', 'Email is required').isEmail(),
    check('password','Password must be atleast 6 characters').isLength({min: 6})
],async(req, res)=>{
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(401).json({
        success: false, 
        error: errors.array()
    })
}
const{ email, password}= req.body;
try {
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({
            success: false,
            msg: "Invalid Credentials"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(404).json({
            success: false,
            msg: "Invalid Credentials"
        })
    }
    const payload = {
        user:{
            id: user.id
        }
    }
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:'7d'}, (err, token)=>{
        if(err) throw err;

        res.status(200).json({
            success: true,
            msg:"User Logedin Successfully",
            token
        })
    })
} catch (err) {
     console.error(err.messsage);
         res.status(500).json({
            success: false,
            msg: "Server error"
        })
}
})

module.exports= router;