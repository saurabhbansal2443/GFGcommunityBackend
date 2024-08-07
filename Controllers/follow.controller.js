import Follow from "../Models/follow.model.js";
import mongoose from "mongoose";

// Add or remove a follower
let addFollower = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let followByID = req.user._id;
    let followToID = req.body.id;

    let existingFollow = await Follow.findOne({ followedBy: followByID, followedTo: followToID });

    if (existingFollow) {
      let deletedFollow = await Follow.findByIdAndDelete(existingFollow._id);
      return res.status(200).send({ result: true, message: "Follow removed", data: deletedFollow });
    } else {
      let newFollow = new Follow({ followedBy: followByID, followedTo: followToID });
      let followerData = await newFollow.save();
      return res.status(200).send({ result: true, message: "Follower added", data: followerData });
    }
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Get followers of the authenticated user
let getMyFollower = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = new mongoose.Types.ObjectId(req.user._id);

    let followerList = await Follow.aggregate([
      {
        $match: { followedTo: userID }
      },
      {
        $lookup: {
          from: "users",
          localField: "followedBy",
          foreignField: "_id",
          as: "followerDetails"
        }
      },
      {
        $unwind: "$followerDetails"
      },
      {
        $project: {
          _id: 1,
          followedBy: 1,
          followedTo: 1,
          createdAt: 1,
          "followerDetails._id": 1,
          "followerDetails.userName": 1,
          "followerDetails.email": 1,
          "followerDetails.profilePicture": 1
        }
      }
    ]);

    return res.status(200).send({
      result: true,
      message: "Follower list retrieved successfully",
      data: followerList
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
}

// Get following of the authenticated user
let getMyFollowing = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = new mongoose.Types.ObjectId(req.user._id);

    let followingList = await Follow.aggregate([
      {
        $match: { followedBy: userID }
      },
      {
        $lookup: {
          from: "users",
          localField: "followedTo",
          foreignField: "_id",
          as: "followingDetails"
        }
      },
      {
        $unwind: "$followingDetails"
      },
      {
        $project: {
          _id: 1,
          followedBy: 1,
          followedTo: 1,
          createdAt: 1,
          "followingDetails._id": 1,
          "followingDetails.userName": 1,
          "followingDetails.email": 1,
          "followingDetails.profilePicture": 1
        }
      }
    ]);

    return res.status(200).send({
      result: true,
      message: "Following list retrieved successfully",
      data: followingList
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
}

export { addFollower, getMyFollower, getMyFollowing };
