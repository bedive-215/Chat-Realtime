import cloudinary from "../configs/cloudinaryConf.js";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (buffer, folder = "chat_images") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
