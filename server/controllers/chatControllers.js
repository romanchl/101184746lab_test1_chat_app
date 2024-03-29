const asyncHandler = require("express-async-handler");
const { chats } = require("../data/data");
const Chat = require('../models/chatModel');
const User = require("../models/UserModel");


const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  });


  const fetchChats = asyncHandler(async(req,res) => {
    try{
      Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
      .populate("users", "-password")
      .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(results)=>{
          results = await User.populate(results,{
            path: "latestMessage.sender",
            select: "name username",
    });
    res.status(200),send(results)
       })
      
    } catch(error){
      res.status(400)
      throw new Error(error.message)
    }
  })

  const createGroupChat = asyncHandler(async(req,res) => {
    if(!req.body.users || !req.body.room){
      return res.status(400).send({message:"Fill all fields"})
    }

    var users = JSON.parse(req.body.users)

    if(users.length < 2) {
      return res
      .status(400)
      .send("More than 2 users are required")
    }

    users.push(req.user);

    try {

      const groupChat = await Chat.create({
        room:req.body.room,
        users:users,
        isGroupChat:true
      })

      const fullGroupChat = await Chat.findOne({_id:groupChat._id})
      .populate("users","-password")
      
      res.status(200).json(fullGroupChat)
    }catch(error){
      throw new Error(error.message)
    }
  })

  


module.exports = {accessChat,fetchChats,createGroupChat}