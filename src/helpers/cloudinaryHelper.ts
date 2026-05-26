import cloudinary from "../config/Cloudinaryconfig.js";

async function uploadToCloudinary(filePath:string){
    try{
        const uploadImage = await cloudinary.uploader.upload(filePath);
        return {
            url: uploadImage.secure_url,
            publicId: uploadImage.public_id
        }

    }catch(error:any){
        console.error("Cloudinary Upload Error:", error);
        throw new Error(error.message || "Failed to upload to Cloudinary");
    }
}
export default uploadToCloudinary;