// app/api/students/route.js
// Students API
// - Fetches students based on user role (parent / teacher)
// - Used by dashboards to display associated students
// - Server-only route (App Router)

import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    // Ensure database connection
    await connectDB();

    // Extract and normalize query params
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    // Basic request validation
    if (!role || !userId) {
      return NextResponse.json(
        { error: "Missing role or userId" },
        { status: 400 }
      );
    }

    // Validate Mongo ObjectId early
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid userId" },
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    let query = {};

    // Build role-based query
    if (role === "parent") {
      query.parent = objectId;
    } else if (role === "teacher") {
      query.teacher = objectId;
    } else {
      // Reject unsupported roles explicitly
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Execute query with required relations
    const students = await Student.find(query)
      .populate("parent", "name email")
      .populate("teacher", "name email")
      .lean(); // Convert to plain JS objects for performance

    // Successful response
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    // Centralized error handling
    console.error("Error fetching students:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    // Get teacher from session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }
    
    if (session.user.role !== "teacher") {
      console.error("User role is not teacher:", session.user.role);
      return NextResponse.json({ error: "Unauthorized - Not a teacher" }, { status: 401 });
    }

    const { name, grade, school, subjects, parentId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Student name required" }, { status: 400 });
    }

    // If parentId is provided, validate it
    let validParentId = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
      }
      validParentId = new mongoose.Types.ObjectId(parentId);
    }

    const student = await Student.create({
      name,
      grade: grade || "",
      school: school || "",
      subjects: subjects || [],
      parent: validParentId || null,
      teacher: new mongoose.Types.ObjectId(session.user.id),
    });

    // Fetch the populated student
    const populatedStudent = await Student.findById(student._id)
      .populate("parent", "name email")
      .populate("teacher", "name email")
      .lean();

    // Convert to plain JSON for serialization
    const result = JSON.parse(JSON.stringify(populatedStudent));

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/students:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
