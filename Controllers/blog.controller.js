import Blog from "../Models/blog.model.js";
import Like from "../Models/like.model.js";
import Comment from "../Models/comment.model.js";
import Saveblog from "../Models/Saveblog.model.js";

// Create a new blog
let createBlog = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    let id = req.user._id;
    let blogData = { ...req.body, user: id };
    let blog = new Blog(blogData);

    blogData = await blog.save();

    return res.status(200).json({
      result: true,
      message: "Blog posted successfully",
      data: blogData,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Update an existing blog
let updateBlog = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    let id = req.user._id;
    let blogData = { ...req.body, user: id };
    let blogId = blogData.id;

    let updatedBlog = await Blog.findByIdAndUpdate(blogId, blogData, { new: true });

    return res.status(200).json({
      result: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Delete a blog
let deleteBlog = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    let blogId = req.body.id;

    let deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res.status(404).send({ result: false, message: "Blog not found" });
    }

    let deletedComments = await Comment.deleteMany({ blog: blogId });
    let deletedLikes = await Like.deleteMany({ blog: blogId });
    let deletedSavedBlogs = await Saveblog.deleteMany({ blog: blogId });

    return res.status(200).json({
      result: true,
      message: "Blog deleted successfully",
      data: { deletedBlog, deletedComments, deletedLikes, deletedSavedBlogs },
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Get all blogs
let getAllBlog = async (req, res) => {
  try {
    let userID = req?.user?._id || null;

    let allBlogs = await Blog.aggregate([
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "blog",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$likes" },
          likedByUser: userID ? { $in: [userID, "$likes.user"] } : false,
        },
      },
      {
        $project: {
          likes: 0, // Exclude the 'likes' array if you don't need it
        },
      },
    ]);

    return res.status(200).json({
      result: true,
      message: "All Blogs",
      data: allBlogs,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Get blogs by a specific user
let getBlogByUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = req.user._id;

    let blogs = await Blog.aggregate([
      {
        $match: { user: userID },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "blog",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$likes" },
          likedByUser: { $in: [userID, "$likes.user"] },
        },
      },
      {
        $project: {
          likes: 0, // Exclude the 'likes' array if you don't need it
        },
      },
    ]);

    return res.status(200).json({
      result: true,
      message: "All Blogs by User",
      data: blogs,
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

export { createBlog, updateBlog, deleteBlog, getAllBlog, getBlogByUser };
