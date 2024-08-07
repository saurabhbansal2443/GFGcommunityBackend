import Comment from "../Models/comment.model.js";
import mongoose from "mongoose";

// Adding a comment
let addComment = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
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

// Updating a comment
let updateComment = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = req.user._id;
    let { _id, commentMessage } = req.body;

    let comment = await Comment.findById(_id);
    if (comment.user.toString() !== userID.toString()) {
      return res.status(401).send({ result: false, message: "This is not your comment" });
    }

    comment.commentMessage = commentMessage;
    let updatedComment = await comment.save();

    return res.status(200).send({
      result: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Deleting a comment
let deleteComment = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = req.user._id;
    let { _id } = req.body;

    let comment = await Comment.findById(_id);
    if (comment.user.toString() !== userID.toString()) {
      return res.status(401).send({ result: false, message: "This is not your comment" });
    }

    let deletedComment = await Comment.findByIdAndDelete(_id);

    return res.status(200).send({
      result: true,
      message: "Comment deleted successfully",
      data: deletedComment,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Getting comments by blog ID
let getCommentsByBlogId = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let blogID = req.body.blogID;

    let comments = await Comment.aggregate([
      {
        $match: { blog: new mongoose.Types.ObjectId(blogID) },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
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
          "user.profilePicture": 1,
        },
      },
    ]);

    return res.status(200).json({
      result: true,
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

export { addComment, updateComment, deleteComment, getCommentsByBlogId };
