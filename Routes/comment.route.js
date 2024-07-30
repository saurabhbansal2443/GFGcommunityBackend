import express from 'express';
import auth from '../Middelwares/auth.middelware.js';
import {addComment , updateComment , deleteComment , getCommentsByBlogId} from "../Controllers/comment.controller.js";
let Router = express.Router();  

Router.
post("/add" ,auth, addComment)
.post("/update" ,auth, updateComment)
.delete("/delete",auth,deleteComment)
.get("/" ,auth,  getCommentsByBlogId)


export default Router;