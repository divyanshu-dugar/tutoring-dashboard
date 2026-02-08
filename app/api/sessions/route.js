// app/api/sessions/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET
 * Fetch sessions for a student (scoped to logged-in teacher)
 */
export async function GET(req) {
  try {
    await connectDB();

    // 🔐 Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "teacher" && session.user.role !== "parent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Valid studentId is required" },
        { status: 400 }
      );
    }

    if(session.user.role === "parent") {
        const sessions = await Session.find({
          student: studentId,
        })
          .sort({ date: -1 })
          .lean();      
          return NextResponse.json(sessions, { status: 200 });
    }else{
        const sessions = await Session.find({
          student: studentId,
          teacher: teacherId,
        })
          .sort({ date: -1 })
          .lean();
          return NextResponse.json(sessions, { status: 200 });
    }

  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST
 * Create a new session (teacher only)
 */
export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const body = await req.json();

    const { studentId, date, sessionNotes, parentNotes, homework } = body;

    if (!studentId || !sessionNotes) {
      return NextResponse.json(
        { error: "studentId and sessionNotes are required" },
        { status: 400 }
      );
    }

    const newSession = await Session.create({
      student: studentId,
      teacher: teacherId,
      sessionNotes,
      parentNotes,
      homework,
      date: date ? new Date(date) : new Date(),
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 * Update an existing session (ownership enforced)
 */
export async function PATCH(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const body = await req.json();

    const { sessionId, date, sessionNotes, parentNotes, homework } = body;

    if (!sessionId || !sessionNotes) {
      return NextResponse.json(
        { error: "sessionId and sessionNotes are required" },
        { status: 400 }
      );
    }

    const updated = await Session.findOneAndUpdate(
      { _id: sessionId, teacher: teacherId }, // 🔒 ownership check
      {
        sessionNotes,
        parentNotes,
        homework,
        date: date ? new Date(date) : new Date(),
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
/**
 * DELETE
 * Delete a session (teacher only, ownership enforced)
 */
export async function DELETE(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { error: "Valid sessionId is required" },
        { status: 400 }
      );
    }

    const deleted = await Session.findOneAndDelete({
      _id: sessionId,
      teacher: teacherId, // 🔒 ownership check
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}