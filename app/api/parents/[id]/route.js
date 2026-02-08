import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid parent ID" }, { status: 400 });
    }

    const parent = await User.findById(id).select("_id name email").lean();

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json(parent, { status: 200 });
  } catch (error) {
    console.error("Error fetching parent:", error);
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
      return NextResponse.json({ error: "Invalid parent ID" }, { status: 400 });
    }

    const { name, email, password } = await req.json();

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    // Check if email is already taken by another user
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    const parent = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("_id name email")
      .lean();

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json(parent, { status: 200 });
  } catch (error) {
    console.error("Error updating parent:", error);
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
      return NextResponse.json({ error: "Invalid parent ID" }, { status: 400 });
    }

    // Check if parent has students
    const studentCount = await Student.countDocuments({ parent: id });
    if (studentCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete parent with assigned students" },
        { status: 400 }
      );
    }

    const parent = await User.findByIdAndDelete(id);

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Parent deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting parent:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
