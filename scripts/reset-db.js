import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function reset() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared ${collection.name}`);
    }

    console.log("✅ Database reset complete");
  } catch (error) {
    console.error("❌ Reset error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

reset();