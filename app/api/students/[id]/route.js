import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const student = await Student.findById(id)
      .populate("parent", "name email")
      .populate("teacher", "name email")
      .lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const { parentId } = await req.json();

    // Validate parentId if provided
    let updateData = {};
    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parent = null;
      } else if (mongoose.Types.ObjectId.isValid(parentId)) {
        updateData.parent = new mongoose.Types.ObjectId(parentId);
      } else {
        return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
      }
    }

    const student = await Student.findByIdAndUpdate(id, updateData, { new: true })
      .populate("parent", "name email")
      .populate("teacher", "name email")
      .lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
