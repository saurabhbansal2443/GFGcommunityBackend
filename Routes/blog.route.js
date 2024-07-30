import express from 'express';
import auth from '../Middelwares/auth.middelware.js';
import  {createBlog , updateBlog , deleteBlog , getAllBlog , getBlogByUser } from "../Controllers/blog.controller.js"
let Router = express();

Router
.post("/create",auth, createBlog)
.patch("/update" ,auth, updateBlog)
.delete("/delete" ,auth, deleteBlog)
.get("/" , getAllBlog)
.get("/user" ,auth, getBlogByUser)

export default Router   
