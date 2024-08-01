import express from "express";
import {add , saved } from "../Controllers/saveBlog.controller.js"

let Router = express.Router();

Router
.post("/add" , add )
.get("/" , saved )


export default Router;  