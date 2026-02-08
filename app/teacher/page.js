// app/teacher/page.jsx
// Teacher dashboard page
// - Server Component
// - Ensures only authenticated teachers can access
// - Displays students and parents linked to the logged-in teacher

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";
import TeacherDashboardClient from "./client";

export default async function TeacherPage() {
  // Fetch active session on the server
  const session = await getServerSession(authOptions);

  // Enforce authentication and role-based access
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/");

  let students = [];
  let parents = [];

  try {
    await connectDB();

    // Fetch students associated with the teacher
    const rawStudents = await Student.find({ teacher: session.user.id })
      .populate("parent", "name email")
      .populate("teacher", "name email")
      .lean();

    // Convert to plain JSON to avoid serialization errors
    students = JSON.parse(JSON.stringify(rawStudents));

    // Fetch all parents (not just those with students for this teacher)
    const rawParents = await User.find({ role: "parent" })
      .select("_id name email")
      .lean();

    // Convert to plain JSON to avoid serialization errors
    parents = JSON.parse(JSON.stringify(rawParents));
  } catch (error) {
    console.error("Error fetching data:", error);
    // Graceful fallback for API failure
    return (
      <section className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Teacher Dashboard</h1>
        <p className="text-sm text-red-600">
          Unable to load dashboard. Please try again later.
        </p>
      </section>
    );
  }

  return (
    <TeacherDashboardClient initialStudents={students} initialParents={parents} />
  );
}
