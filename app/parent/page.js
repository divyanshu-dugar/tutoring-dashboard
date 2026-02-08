// app/parent/page.jsx
// Parent dashboard page
// - Server Component
// - Ensures only authenticated parents can access
// - Displays children linked to the logged-in parent

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export default async function ParentPage() {
  // Fetch active session on the server
  const session = await getServerSession(authOptions);

  // Enforce authentication and role-based access
  if (!session) redirect("/login");
  if (session.user.role !== "parent") redirect("/");

  let students = [];

  try {
    await connectDB();

    // Fetch students associated with the parent directly from database
    const rawStudents = await Student.find({ parent: session.user.id })
      .populate("parent", "name email")
      .populate("teacher", "name email")
      .lean();

    // Convert to plain JSON to avoid serialization errors
    students = JSON.parse(JSON.stringify(rawStudents));
  } catch (error) {
    console.error("Error fetching students:", error);
    // Graceful fallback for API failure
    return (
      <section className="p-6">
        <h1 className="text-2xl font-semibold mb-2">My Children</h1>
        <p className="text-sm text-red-600">
          Unable to load students. Please try again later.
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Children</h1>

      {/* Empty state */}
      {students.length === 0 && (
        <p className="text-gray-500">No students found.</p>
      )}

      {/* Student cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {students.map((student) => (
          <Link
            key={student._id}
            href={`/parent/student/${student._id}`}
            className="rounded-xl border bg-white p-4 transition hover:shadow-md"
          >
            <h3 className="font-medium text-lg">{student.name}</h3>
            <p className="text-sm text-gray-600">{student.grade}</p>
            <p className="text-sm text-gray-500">{student.school}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
