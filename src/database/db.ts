import mongoose from "mongoose";

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL as string)
        console.log("Connected to MongoDB highly spiritually")
    }catch(error){
        console.log(error)
        console.log("Failed to connect to MongoDB")
        process.exit(1)
    }
}
export default connectDB;