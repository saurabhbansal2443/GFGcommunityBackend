import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";

let cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};
let auth = async (req, res, next) => {
  // getting the token from frontend
  let accessToken = req.cookies?.AccessToken;
  let refreshToken = req.cookies?.RefreshToken;

  // checking the accessToken
  try {
    if (!accessToken && !refreshToken) {
      return res
        .status(401)
        .send({ result: false, message: "unauthorized user" });
    }
    // trying to check for access token
    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_KEY);
    } catch (err) {
      console.log("accessToken is not present or expired ", err);
    }
    // decoding access token
    if (decodedAccessToken) {
      let user = await User.findById(decodedAccessToken._id);
      if (!user) {
        return res
          .status(401)
          .send({ result: false, message: "user not found  " });
      }
      req.user = user;
      return next();
    }
    // If accessToken is either expired not present or any there is any issue with acess token then check for refresh token
    if (refreshToken) {
      let decodedRefreshToken;
      try {
        decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_KEY);
      } catch (err) {
        return res
          .status(401)
          .send({ result: false, message: "Unauthorized user" });
      }
      // geting user from refresh token
      let user = await User.findById(decodedRefreshToken._id);
      // checking for user and validating the refresh token
      if (!user || user.refreshToken !== refreshToken) {
        return res
          .status(401)
          .send({ result: false, message: "Unauthorized user" });
      }
      // genreating the new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await user.generateToken();
      // updating the token in Database
      user.refreshToken = newRefreshToken;
      // saving the new user
      await user.save();
      // setting up cookie (but donot send the response )
      res.cookie("AccessToken", newAccessToken, cookieOptions);
      res.cookie("RefreshToken", newRefreshToken, cookieOptions);

      req.user = user;
      return next();
    }
  } catch (err) {
    return res.status(500).send({ result: false, message: err.message });
  }
};


export default auth;
