// app/teacher/page.jsx
// Teacher dashboard
// - Server Component
// - Lists students assigned to the logged-in teacher
// - Entry point for managing sessions

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TeacherPage() {
  const session = await getServerSession(authOptions);

  // Enforce authentication & role
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  let students = [];

  try {
    const res = await fetch(
      `${baseUrl}/api/students?role=teacher&userId=${session.user.id}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch students");

    students = await res.json();
  } catch {
    return (
      <section className="p-6">
        <h1 className="text-2xl font-semibold mb-2">My Students</h1>
        <p className="text-sm text-red-600">
          Unable to load students. Please try again later.
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Students</h1>

      {students.length === 0 ? (
        <p className="text-gray-500">No students assigned.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {students.map((student) => (
            <Link
              key={student._id}
              href={`/teacher/student/${student._id}`}
              className="rounded-xl border bg-white p-4 transition hover:shadow-md"
            >
              <h3 className="font-medium text-lg">{student.name}</h3>
              <p className="text-sm text-gray-600">{student.grade}</p>
              <p className="text-sm text-gray-500">
                Parent: {student.parent?.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
