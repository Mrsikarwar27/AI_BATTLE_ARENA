import mongoose from "mongoose";
import config from "./config.js";

export async function connectDB(): Promise<void> {
    if (!config.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined. Set it in Backend/.env");
    }
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(config.MONGODB_URI);
    console.log("MongoDB connected");
}

export default connectDB;
