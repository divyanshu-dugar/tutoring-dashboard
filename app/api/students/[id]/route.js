import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Session from "@/models/Session";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

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

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const { name, grade, school, subjects, parentId } = await req.json();

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (grade !== undefined) updateData.grade = grade;
    if (school !== undefined) updateData.school = school;
    if (subjects !== undefined) updateData.subjects = subjects;
    
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

    // Convert to plain JSON for serialization
    const result = JSON.parse(JSON.stringify(student));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    // Delete all sessions associated with this student
    await Session.deleteMany({ student: id });

    // Delete the student
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Student deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
