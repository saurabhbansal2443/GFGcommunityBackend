import User from "../Models/user.model.js";
import uploadOnCloudinary from "../Utility/Cloudinary.js";
import mongoose from "mongoose";

let cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

// Generate Token
async function generateToken(currUser) {
  return await currUser.generateToken();
}

// Signup Controller
let signup = async (req, res) => {
  let { email } = req.body;

  try {
    let user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(409)
        .send({ result: false, message: "User already exists" });
    }

    let newUser = new User(req.body);
    let { accessToken, refreshToken } = await generateToken(newUser);

    newUser.refreshToken = refreshToken;

    let newUserData = await newUser.save();

    return res
      .status(201)
      .cookie("AccessToken", accessToken, cookieOptions)
      .cookie("RefreshToken", refreshToken, cookieOptions)
      .send({
        result: true,
        message: "User created successfully",
        data: newUserData,
      });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Login Controller
let login = async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(401)
        .send({ result: false, message: "User not found" });
    }

    let passwordCheck = await user.comparePassword(password);

    if (passwordCheck) {
      let { accessToken, refreshToken } = await generateToken(user);

      let updatedUser = await User.findByIdAndUpdate(
        user._id,
        { refreshToken: refreshToken },
        { new: true }
      );

      return res
        .status(200)
        .cookie("AccessToken", accessToken, cookieOptions)
        .cookie("RefreshToken", refreshToken, cookieOptions)
        .send({
          result: true,
          message: "User login successfully",
          data: updatedUser,
        });
    } else {
      return res
        .status(401)
        .send({ result: false, message: "Email/password is incorrect" });
    }
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Get User
let getUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    let userID = req.user._id;

    // Aggregation pipeline to get follower count, following count, and blog count
    let aggregationResult = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userID) } },
      {
        $lookup: {
          from: "follows",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$followedTo", "$$userId"] } } },
            { $count: "followerCount" }
          ],
          as: "followerData"
        }
      },
      {
        $lookup: {
          from: "follows",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$followedBy", "$$userId"] } } },
            { $count: "followingCount" }
          ],
          as: "followingData"
        }
      },
      {
        $lookup: {
          from: "blogs",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
            { $count: "blogCount" }
          ],
          as: "blogData"
        }
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          email: 1,
          profilePicture: 1,
          followerCount: { $arrayElemAt: ["$followerData.followerCount", 0] },
          followingCount: { $arrayElemAt: ["$followingData.followingCount", 0] },
          blogCount: { $arrayElemAt: ["$blogData.blogCount", 0] }
        }
      }
    ]);

    if (aggregationResult.length === 0) {
      return res.status(404).send({ result: false, message: "User not found" });
    }

    let userData = aggregationResult[0];
    userData.followerCount = userData.followerCount || 0;
    userData.followingCount = userData.followingCount || 0;
    userData.blogCount = userData.blogCount || 0;

    return res.status(200).send({
      result: true,
      message: "Success",
      data: userData
    });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Update User
let updateUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    let { password, ...rest } = req.body;

    if (password) {
      req.user.password = password;
      await req.user.save();
    }
    let updatedUser = await User.findByIdAndUpdate(req.user._id, rest, { new: true });

    return res.status(200).send({ result: true, message: "User updated successfully", data: updatedUser });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Logout User
let logout = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });
    res.clearCookie("AccessToken", cookieOptions);
    res.clearCookie("RefreshToken", cookieOptions);
    return res.status(200).send({ result: true, message: "Logout successful" });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};

// Upload Photo
let uploadPhoto = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    let photoDetails = await uploadOnCloudinary(req.file.path);
    let photoUrl = photoDetails.url;

    let updatedUser = await User.findByIdAndUpdate(req.user._id, { profilePicture: photoUrl }, { new: true });

    return res.send({ result: true, message: "Photo uploaded successfully", data: updatedUser });
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
}

export { signup, login, updateUser, logout, getUser, uploadPhoto };
