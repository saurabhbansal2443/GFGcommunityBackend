import Like from "../Models/like.model.js";

// Add or remove a like
let addLike = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = req.user._id;
    let blogId = req.body.id;

    let existingLike = await Like.findOne({ user: userID, blog: blogId });

    if (existingLike) {
      let deletedLike = await Like.findByIdAndDelete(existingLike._id);
      return res.status(200).send({ result: true, message: "Like removed", data: deletedLike });
    } else {
      let newLike = new Like({ user: userID, blog: blogId });
      let likeData = await newLike.save();
      return res.status(200).send({ result: true, message: "Like added to post", data: likeData });
    }
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
}

// Get all blogs liked by a user
let getLikedBlog = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = req.user._id;

    // Aggregation pipeline to get all blogs liked by the user
    let likedBlogs = await Like.aggregate([
      { $match: { user: userID } },
      {
        $lookup: {
          from: 'blogs', // The name of the Blog collection
          localField: 'blog',
          foreignField: '_id',
          as: 'blogDetails'
        }
      },
      { $unwind: '$blogDetails' },
      {
        $project: {
          _id: 0,
          blog: '$blogDetails'
        }
      }
    ]);

    return res.status(200).send({ result: true, message: "All liked blogs data by user", data: likedBlogs });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
}

// Get the count of likes a blog is having
let likeCount = async (req, res) => {
  try {
    let blogId = req.body.id;

    let count = await Like.countDocuments({ blog: blogId });

    return res.status(200).send({ result: true, message: "Like count retrieved successfully", data: count });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
}

export { addLike, getLikedBlog, likeCount };
