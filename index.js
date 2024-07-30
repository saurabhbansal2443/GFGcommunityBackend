import express from "express";
import "dotenv/config";
import dbconnect from "./Database/dbConnect.js";
import cookieParser from "cookie-parser";
import userRouter from "./Routes/user.route.js"
import blogRouter from "./Routes/blog.route.js"
import likeRouter from "./Routes/like.route.js"
import commentRouter from "./Routes/comment.route.js"

let server = express();

let port = process.env.PORT || 3000;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());


// Api Routes 

server.use("/users" , userRouter);
server.use("/blogs" , blogRouter);
server.use("/likes" , likeRouter);
server.use("/comments" , commentRouter);


dbconnect()
  .then(() => {
    console.log("Database  is connected ");

    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(" DataBase error ", err);
  });

// try{
//     await
//     await
//     await
// }catch(err){
// console.log( err.message )
// }
