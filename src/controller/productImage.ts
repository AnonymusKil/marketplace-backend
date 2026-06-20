import uploadToCloudinary from "../helpers/cloudinaryHelper.js";
import type { Request, Response } from "express";

interface UploadImageResponse {
  url: string;
  publicId: string;
}

export async function uploadProductImage(req: Request, res: Response) {
  try {
    if (!req.files) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("Received file:", req.files);
    const images = req.files as Express.Multer.File[];
    const uploadImageResults = await Promise.all(
      images.map((file) => uploadToCloudinary(file.path as string) as Promise<UploadImageResponse>)
    );
    const imageUrls = uploadImageResults.map(result => result.url);
    const publicIds = uploadImageResults.map(result => result.publicId);
    return res.status(200).json({ imageUrls, publicIds });


  }
    catch (error: any) {
        console.error("Image Upload Error:", error);
        return res.status(500).json({
            message: error.message || "Failed to upload image",
        });
    }
}