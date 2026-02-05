import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    
    const testParentId = "697ebfb72198a4184c5be1c6";
    
    // Test 1: Check if the Student model is working
    const allStudents = await Student.find({});
    console.log("📊 All students in DB:", allStudents.length);
    console.log("📊 Sample student:", allStudents[0]);
    
    // Test 2: Check with the specific ID
    const objectId = new mongoose.Types.ObjectId(testParentId);
    console.log("🔍 Searching for parent ID:", objectId.toString());
    
    const studentsForParent = await Student.find({ parent: objectId });
    console.log("🔍 Students found:", studentsForParent.length);
    console.log("🔍 First student:", studentsForParent[0]);
    
    // Test 3: Check the raw parent field value
    const rawStudent = await Student.findOne({});
    console.log("🔍 Raw parent field type:", typeof rawStudent?.parent);
    console.log("🔍 Raw parent field value:", rawStudent?.parent);
    console.log("🔍 Raw parent toString:", rawStudent?.parent?.toString());
    
    return NextResponse.json({
      allStudentsCount: allStudents.length,
      allStudents: allStudents,
      testParentId: testParentId,
      objectId: objectId.toString(),
      studentsForParent: studentsForParent,
      rawSample: rawStudent ? {
        _id: rawStudent._id.toString(),
        parent: rawStudent.parent.toString(),
        parentType: typeof rawStudent.parent
      } : null
    });
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}