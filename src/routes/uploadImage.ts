import express from "express";
const router = express.Router();
import { upload } from "../middleware/imagemiddleware.js";
import { uploadSellerLogo } from "../controller/imageUploader.js";
import {uploadProductImage} from "../controller/productImage.js";

router.get("/image", (req, res) => {
  res.send("Hello from image upload route");
});

router.post("/upload-logo", upload.single("logo"), uploadSellerLogo);
router.post("/upload-product-image", upload.array("images", 4), uploadProductImage);
export default router;
