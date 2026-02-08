import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all parents (not just those with students for this teacher)
    // This allows flexibility in assigning students to any parent
    const parents = await User.find({ role: "parent" })
      .select("_id name email")
      .lean();

    return NextResponse.json(parents, { status: 200 });
  } catch (error) {
    console.error("Error fetching parents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }
    
    if (session.user.role !== "teacher") {
      console.error("User role is not teacher:", session.user.role);
      return NextResponse.json({ error: "Unauthorized - Not a teacher" }, { status: 401 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const parent = await User.create({
      name,
      email,
      passwordHash,
      role: "parent",
    });

    // Return only necessary fields
    return NextResponse.json(
      {
        _id: parent._id,
        name: parent.name,
        email: parent.email,
        role: parent.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/parents:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}