import Like from "../Models/like.model.js";


// send blog ID in body ( id : blogId )
// add/ remove the like 
let addLike = async (req,res)=>{
    if (!req.user) {
        return res
          .status(401)
          .send({ result: false, message: "User not Authenticated " });
      }
      try {
        let userID = req.user._id;
        let blogId = req.body.id ;
        
        let existingLike = await Like.findOne({ user : userID, blog : blogId });

        if (existingLike) {
            let deletedLike = await Like.findByIdAndDelete(existingLike._id);
            return res.status(200).send({ result: true , message : "removed like" , data : deletedLike})
        }else{
            let newLike = new Like({user : userID, blog : blogId});
            let likeData = await newLike.save();
            return res.status(200).send({ result: true , message : "Like added to post " , data :likeData })
        }
        
      } catch (err) {
        return res.status(500).send({ result: false, message: err.message });
      }
}
// get all the blogs liked by a user (nothing required )
let getLikedBlog = async (req,res)=>{
    if (!req.user) {
        return res
          .status(401)
          .send({ result: false, message: "User not Authenticated " });
      }
      try {
        let userID = req.user._id;

         // Aggregation pipeline to get all blogs liked by the user
         let likedBlogs = await Like.aggregate([
            { $match: { user: userID } },
            {
                $lookup: {
                    from: 'blogs', // The name of the Blog collection
                    localField: 'blog',
                    foreignField: '_id',
                    as: 'blogDetails'
                }
            },
            { $unwind: '$blogDetails' },
            {
                $project: {
                    _id: 0,
                    blog: '$blogDetails'
                }
            }
        ]);

        return res.status(200).send({ result: true, message : "all liked blogs data by user " , data : likedBlogs });



      } catch (err) {
        return res.status(500).send({ result: false, message: err.message });
      }
}
// This is to count the number of likes a blog is having 
let likeCount = async (req,res )=>{

}

export {addLike, getLikedBlog , likeCount};