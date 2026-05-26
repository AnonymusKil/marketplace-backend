import uploadToCloudinary from "../helpers/cloudinaryHelper.js";
import type { Request, Response } from "express";

interface UploadImageResponse {
  url: string;
  publicId: string;
}

export async function uploadSellerLogo(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Received file:", req.file);

    const { url, publicId } = await uploadToCloudinary(req.file.path as string) as UploadImageResponse;
    
    return res.status(200).json({ url, publicId });

  } catch (error: any) {
    console.error("Image Upload Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to upload image",
    });
  }
}
