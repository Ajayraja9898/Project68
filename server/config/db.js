import mongoose from "mongoose";

const connectDB = async () => {
  console.log("=================================");
  console.log("🚀 Connecting to MongoDB...");
  console.log("URI exists:", !!process.env.MONGODB_URI);
  console.log("=================================");

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("=================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log("=================================");
  } catch (error) {
    console.log("=================================");
    console.error("❌ MongoDB Connection Failed");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);

    if (error.cause) {
      console.error("Cause:", error.cause);
    }

    console.error("Full Error:");
    console.error(error);
    console.log("=================================");

    process.exit(1);
  }
};

export default connectDB;