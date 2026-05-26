import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY as string,

})
console.log("Cloudinary Configured:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "****" : "Not Set",
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY ? "****" : "Not Set",
})
export default cloudinary;