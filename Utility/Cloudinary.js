import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
 
    if (!localfilepath) {
      return { error: "No file path provided" };
    }
  
    try {
      const uploadResult = await cloudinary.uploader.upload(localfilepath, {
        resource_type: "auto",
      });
      fs.unlinkSync(localfilepath);
      return uploadResult;
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
  
       fs.unlinkSync(localfilepath);
      return { error: "Failed to upload to Cloudinary" };
    }
  };
  
  export default uploadOnCloudinary;
