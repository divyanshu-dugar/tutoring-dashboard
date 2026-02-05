import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Student from "../models/Student.js";
import Session from "../models/Session.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear collections
    await User.deleteMany({});
    await Student.deleteMany({});
    await Session.deleteMany({});
    console.log("✅ Cleared existing data");

    const passwordHash = await bcrypt.hash("password123", 12);

    const teacher = await User.create({
      _id: '697ebfb72198a4184c5be1c7',
      name: "John Tutor",
      email: "teacher@test.com",
      passwordHash,
      role: "teacher",
    });

    const parent = await User.create({
      _id: '697ebfb72198a4184c5be1c6',
      name: "Test Parent",
      email: "parent@test.com",
      passwordHash,
      role: "parent",
    });

    const student = await Student.create({
      name: "Aruhi",
      grade: "Grade 5",
      school: "Terraview-Willowfield Public School",
      subjects: ["Math, English, Social-Science, Coding"],
      parent: parent._id,
      teacher: teacher._id,
    });

    await Session.create({
      student: student._id,
      teacher: teacher._id,
      parentNotes: "First Session - Knowledge Assesment (Math, English)",
      sessionNotes: "First Session - Knowledge Assesment (Math, English)",
      homework: "None",
      date: new Date(), 
    });

    console.log("✅ Seed complete");
    console.log("Teacher: teacher@test.com / password123");
    console.log("Parent: parent@test.com / parent@test.com");
    
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Only run seed() if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}