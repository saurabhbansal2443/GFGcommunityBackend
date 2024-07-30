import User from "../Models/user.model.js";

let cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};
//generate Token 
async function generateToken(currUser) {
  return await currUser.generateToken();
}
//signup controller 
let signup = async (req, res) => {
  let { email } = req.body;

  try {
    let user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(409)
        .send({ result: false, messgae: "User already Exist  " });
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
        message: "User Created succesfully",
        data: newUserData,
      });
  } catch (err) {
    console.log({ result: false, message: err.message });
  }
};

//login controller 
let login = async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(401)
        .send({ result: false, messgae: "User not found " });
    }

    let passwordCheck = await user.comparePassword(password);

    if (passwordCheck == true) {
      let { accessToken, refreshToken } = await generateToken(user);

      let updatedUser = await User.findByIdAndUpdate(
        user._id,
        { refreshToken: refreshToken },
        { new: true }
      );

      // console.log(updateUser);
      return res
        .status(200)
        .cookie("AccessToken", accessToken, cookieOptions)
        .cookie("RefreshToken", refreshToken, cookieOptions)
        .send({
          result: true,
          message: "User Login sucessfully",
          data: updatedUser,
        });
    } else {
      return res
        .status(401)
        .send({ result: false, messgae: "email/password is incorrect" });
    }
  } catch (err) {
    console.log({ result: false, message: err.message });
  }
};

// Get User
let getUser = (req, res) => {
  if (!req.user) {
    return res.status(401).send({ result: false, message: "User not authenticated" });
  }
  try {
    return res.status(200).send({ result: true, message: "Success", data: req.user });
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
    
    let {password, ...rest } =  req.body ;

    if(password ){
      req.user.password = password ;
      await req.user.save();
    }
    let updatedUser = await User.findByIdAndUpdate(req.user._id, rest , { new: true });
  
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
export { signup, login, updateUser, logout, getUser };

// signup login getuser updateuser logout
