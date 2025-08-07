import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect (process.env.MONGO_URL);
        console.log(`MongoDB connected successfully`);
    } catch (error) {
        console.log(`Error connecting mongoDb: ${error.message}`);
        process.exit(1);
        
        
    }
}

export default connectDB;