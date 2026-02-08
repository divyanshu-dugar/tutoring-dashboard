import { connectDB } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

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
