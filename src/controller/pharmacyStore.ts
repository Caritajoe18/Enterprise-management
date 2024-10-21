import {Request, Response} from "express";
import cloudinary from "../utilities/cloudinary";


export const uploadImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(500).json({ error: "no file uploaded" });
      }
      const imageUpload = await cloudinary.uploader.upload(req.file.path);
      res.status(200).json({ imageUrl: imageUpload.secure_url });
    } catch (error) {
      res.status(500).json({ error: "image upload failed" });
    }
  };