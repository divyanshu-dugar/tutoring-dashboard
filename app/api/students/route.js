// app/api/students/route.js
// Students API
// - Fetches students based on user role (parent / teacher)
// - Used by dashboards to display associated students
// - Server-only route (App Router)

import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

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
