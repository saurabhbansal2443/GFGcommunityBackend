import Saveblog from "../Models/Saveblog.model.js";

// add/ remove 
let add = async ( req,res )=>{
    if (!req.user) {
        return res
          .status(401)
          .send({ result: false, message: "User not Authenticated " });
      }
      try {
        let userID = req.user._id;
        let blogId = req.body.id ;
        
        let existingSaveblog = await Saveblog.findOne({ user : userID, blog : blogId });

        if (existingSaveblog) {
            let deletedSaveblog = await Saveblog.findByIdAndDelete(existingSaveblog._id);
            return res.status(200).send({ result: true , message : "Removed saved blog " , data : deletedSaveblog})
        }else{
            let newSaveBlog= new Saveblog({user : userID, blog : blogId});
            let SaveblogData = await newSaveBlog.save();
            return res.status(200).send({ result: true , message : " Saved blog " , data :SaveblogData })
        }
        
      } catch (err) {
        return res.status(500).send({ result: false, message: err.message });
      }
}

// Get Saved Blogs
let saved = async (req, res) => {
    if (!req.user) {
      return res
        .status(401)
        .send({ result: false, message: "User not Authenticated" });
    }
    try {
      let userID = new mongoose.Types.ObjectId(req.user._id);
  
      let savedBlogs = await Saveblog.aggregate([
        {
          $match: { user: userID }
        },
        {
          $lookup: {
            from: "blogs",
            localField: "blog",
            foreignField: "_id",
            as: "blogDetails"
          }
        },
        {
          $unwind: "$blogDetails"
        },
        {
          $project: {
            _id: 1,
            user: 1,
            blog: 1,
            createdAt: 1,
            "blogDetails._id": 1,
            "blogDetails.blogMessage": 1,
            "blogDetails.isAnonymous": 1,
            "blogDetails.hashtag": 1,
            "blogDetails.createdAt": 1,
            "blogDetails.updatedAt": 1
          }
        }
      ]);
  
      return res.status(200).send({
        result: true,
        message: "Saved blogs retrieved successfully",
        data: savedBlogs
      });
    } catch (err) {
      return res.status(500).send({ result: false, message: err.message });
    }
  }

export {add , saved }


