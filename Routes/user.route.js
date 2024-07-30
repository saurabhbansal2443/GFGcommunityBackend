import express from "express";
import auth from "../Middelwares/auth.middelware.js";
import upload from "../Middelwares/multer.middelware.js"
import {
  signup,
  login,
  updateUser,
  logout,
  getUser,
  uplaodPhoto
} from "../Controllers/user.controller.js";
let Router = express.Router();


Router
  .post("/signup", signup)
  .post("/login", login)
  .get("/",auth, getUser)
  .patch("/update",auth, updateUser)
  .post("/logout",auth,  logout)
  .patch("/updatePicture" ,auth, upload.single("profilePicture") ,uplaodPhoto  )

  export default Router;    


  //Update profile picture 