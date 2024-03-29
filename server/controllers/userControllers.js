const User = require('../models/UserModel')
const asyncHandler = require('express-async-handler');
const generateToken = require('../config/generateToken');

const registerUser = asyncHandler(async (req,res) => {
    const {userName,firstName,lastName,password,isAdmin} = req.body;

    const userExists = await User.findOne({userName});

    if(userExists){
        res.status(400)
        throw new Error("User Already Exists")
    }

    const user = await User.create({
        userName,
        firstName,
        lastName,
        password,
        isAdmin
    })

    if(user){
        res.status(201).json({
            _id:user._id,
            userName:user.userName,
            firstName:user.firstName,
            lastName:user.lastName,
            isAdmin:user.isAdmin,
            token:generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Error Occured!')
    }
})



const loginUser = asyncHandler(async (req,res) => {
    const {userName,password} = req.body;

    const user = await User.findOne({userName});

    if(user && (await user.matchPassword(password))){
        res.status(201).json({
            _id:user._id,
            userName:user.userName,
            firstName:user.firstName,
            lastName:user.lastName,
            isAdmin:user.isAdmin,
            token:generateToken(user._id)
        })
        
    } else {
            res.status(400)
            throw new Error("Invalid Email or Password")
        
    }
    

})

// api/user
const allUsers = asyncHandler (async(req,res) => {
    const keyword = req.query
    ? {
        $or: [
            {userName: {$regex:req.query.search,$options:'i'}},
            {lastName: {$regex:req.query.search,$options:'i'}},
        ]
    } : {};
    
    
    const users = await User.find(keyword).find({ _id :{ $ne:req.user._id }})
    res.send(users)
})



module.exports = {registerUser,loginUser,allUsers}

