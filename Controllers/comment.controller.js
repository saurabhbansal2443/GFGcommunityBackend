import Comment from "../Models/comment.model.js";
import mongoose from "mongoose";

// adding comment (blogID : blogID)
let addComment = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not Authenticated " });
  }
  try {
    let userID = req.user._id;
    let { blogID, message } = req.body;

    let newComment = new Comment({
      commentMessage: message,
      blog: blogID,
      user: userID,
    });

    let comment = await newComment.save();

    return res.status(201).send({
      result: true,
      message: "New comment added to blog",
      data: comment,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// send the whole previous comment
// commentID , commentMSG , user 
let updateComment = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not Authenticated " });
  }
  try {
    if( req.body?.user != req.user._id ){ // if user tries to edit someelse commment 
        return res.status(401).send({result : false , message : "This is not your comment" });
    }
    let updatedComment = await Comment.findByIdAndUpdate(req.body._id, req.body , {new : true })

    return res.status(200).send({result : true , message : "comment updated succesfully" , data : updatedComment});
     
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// for these 2 routes only the comment by user(self) can be deleted or getComments 
// user , comment ID 
let deleteComment = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not Authenticated " });
  }
  try {
    if( req.body?.user != req.user._id ){ // if user tries to delete someone else commment 
        return res.status(401).send({result : false , message : "This is not your comment" });
    }

    let deletedComment = await Comment.findByIdAndDelete(req.body._id )
    
    return res.status(200).send({ result : true  , message : "comment deleted Succesfully" , data : deletedComment})

  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};
// BlogID 
let getCommentsByBlogId = async (req, res) => {
    if (!req.user) {
      return res
        .status(401)
        .send({ result: false, message: "User not Authenticated " });
    }
    try {
      let blogID = req.body.blogID ;


  
      let comments = await Comment.aggregate([
        {
          $match: { blog: new mongoose.Types.ObjectId(blogID) }
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            _id: 1,
            commentMessage: 1,
            blog: 1,
            createdAt: 1,
            updatedAt: 1,
            "user._id": 1,
            "user.userName": 1,
            "user.email": 1,
            "user.profilePicture": 1
          }
        }
      ]);
  
      return res.status(200).json({
        result: true,
        message: "Comments retrieved successfully",
        data: comments
      });
    } catch (err) {
      return res.status(500).send({ result: false, message: err.message });
    }
  };
  

export { addComment, updateComment, deleteComment, getCommentsByBlogId };
