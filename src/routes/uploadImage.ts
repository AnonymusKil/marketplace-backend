import express from "express";
const router = express.Router();
import { upload } from "../middleware/imagemiddleware.js";
import { uploadSellerLogo } from "../controller/imageUploader.js";

router.get("/image", (req, res) => {
  res.send("Hello from image upload route");
});

router.post("/upload-logo", upload.single("logo"), uploadSellerLogo);

export default router;
