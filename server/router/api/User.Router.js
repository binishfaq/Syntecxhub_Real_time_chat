const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User.model')

router.get('/me', auth, async(req,res)=>{
try {
    const user= await User.findById(req.user.id).select('-password');
    if(!user){
        return res.status(401).jaon({
             success: false,
        msg: "User not Found"
        })
    }
    res.status(200).json({ success: true,
        user: user})
} catch (err) {
    console.error(err.message);
    res.status(500).json({
        success: false,
        msg: "Server error"
    })
}
});



//search user by name and email

router.get('/search', auth, async(req,res)=>{
    const {q}= req.query
try {

    if(!q){
        return res.status(401).jaon({
             success: false,
        msg: "Search query is required"
        })
    }
    const users= await User.find({
        $or:[
            {username:{$regex: q, $options:"i"}},
            {email:{$regex: q, $options:"i"}}
        ]
    }).select('-password');
    res.status(200).json({ success: true,
        users})
} catch (err) {
    console.error(err.message);
    res.status(500).json({
        success: false,
        msg: "Server error"
    })
}
})


// get by id
router.get('/:id', auth, async(req,res)=>{
try {
    const user= await User.findById(req.params.id).select('-password');
    if(!user){
        return res.status(401).jaon({
             success: false,
        msg: "User not Found"
        })
    }
    res.status(200).json({ success: true,
        user: user})
} catch (err) {
    console.error(err.message);
    res.status(500).json({
        success: false,
        msg: "Server error"
    })
}
});


router.put("/profile", auth, async (req, res) => {
    const {
        username,
        email,
        profileImage,
        bio
    } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // Update only provided fields
        if (username !== undefined) {
            user.username = username;
        }

        if (email !== undefined) {
            user.email = email;
        }

        if (profileImage !== undefined) {
            user.profileImage = profileImage;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            msg: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
                bio: updatedUser.bio,
                status: updatedUser.status
            }
        });

    } catch (err) {
        console.error(err.message);

        // Duplicate username/email
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "Username or email already exists"
            });
        }

        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
});


module.exports = router;