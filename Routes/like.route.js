import express from "express";
import auth from "../Middelwares/auth.middelware.js";
import {addLike, getLikedBlog , likeCount} from "../Controllers/like.controller.js"

let Router = express.Router();


Router
.post("/like" ,auth, addLike) 
.get("/",auth, getLikedBlog)
.post("/postL")

export default Router ;