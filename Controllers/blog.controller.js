import Blog from "../Models/blog.model.js";

let createBlog = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not Authenticated " });
  }
  try {
    let id = req.user._id;
    let blogData = { ...req.body, user: id };
    let blog = new Blog(blogData);

    blogData = await blog.save();

    return res
      .status(200)
      .json({
        result: true,
        message: "Blog posted succesfullly",
        data: blogData,
      });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};
// blogID will be given by frontend in the body ( id : blogID )
let updateBlog = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not Authenticated " });
  }
  try {
    let id = req.user._id;
    let blogData = { ...req.body, user: id };
    let blogId = blogData.id ;

    let updatedBlog = await Blog.findByIdAndUpdate(blogId , blogData , {new : true });
    return res
      .status(200)
      .json({
        result: true,
        message: "Blog updated succesfullly",
        data: updatedBlog,
      });

  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};
// blogID will be given by frontend in the body ( id : blogID )
let deleteBlog = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not Authenticated " });
  }
  try {

    let blogId = req.body.id ;

    let deletedBlog = await Blog.findByIdAndDelete(blogId);
    return res
      .status(200)
      .json({
        result: true,
        message: "Blog deleted succesfullly",
        data: deletedBlog,
      });


  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Nothing required 
let getAllBlog = async (req, res) => {
  // if (!req.user) {
  //   return res.status(401).send({ result: false, message: "User not Authenticated" });
  // }
  try {
    let userID = req?.user?._id || "767e3267gjhdkjhewgfj";

    let allBlogs = await Blog.aggregate([
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'blog',
          as: 'likes'
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          likedByUser: {
            $in: [userID, '$likes.user']
          }
        }
      },
      {
        $project: {
          likes: 0  // Exclude the 'likes' array if you don't need it
        }
      }
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

let getBlogByUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not Authenticated" });
  }
  try {
    let userID = req.user._id;

    let blogs = await Blog.aggregate([
      {
        $match: { user: userID }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'blog',
          as: 'likes'
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          likedByUser: {
            $in: [userID, '$likes.user']
          }
        }
      },
      {
        $project: {
          likes: 0  // Exclude the 'likes' array if you don't need it
        }
      }
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
// createBlog
// updateBlog
// deleteBlog
// getAllBlog
// getBlogByUser
