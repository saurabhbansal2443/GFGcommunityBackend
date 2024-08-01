import express from 'express';
import auth from '../Middelwares/auth.middelware.js';
import {addFollower, getMyFollower, getMyFollowing  } from "../Controllers/follow.controller.js"

let Router = express.Router();

Router
.post("/add" ,auth, addFollower)
.get("/getMyFollower" ,auth, getMyFollower)
.get("/getMyFollowing" ,auth, getMyFollowing)

export default Router;  