"use client";

import { useState } from "react";
import Link from "next/link";

export default function TeacherDashboardClient({ initialStudents, initialParents }) {
  const [students, setStudents] = useState(initialStudents || []);
  const [parents, setParents] = useState(initialParents || []);
  const [loading, setLoading] = useState(false);

  // Create form state for students
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [subjects, setSubjects] = useState("");
  const [parentId, setParentId] = useState("");

  // Create form state for parents
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          grade,
          school,
          subjects: subjects.split(",").map((s) => s.trim()),
          parentId: parentId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error creating student:", res.status, data);
        const errorMsg = data.error || data.details || "Failed to create student";
        alert(errorMsg);
        return;
      }

      setStudents([data, ...students]);

      // Reset form
      setName("");
      setGrade("");
      setSchool("");
      setSubjects("");
      setParentId("");
    } catch (err) {
      console.error("Error creating student:", err);
      alert("Error creating student: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateParent(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: parentName,
          email: parentEmail,
          password: parentPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error creating parent:", res.status, data);
        alert(data.error || "Failed to create parent");
        return;
      }

      setParents([data, ...parents]);

      // Reset form
      setParentName("");
      setParentEmail("");
      setParentPassword("");
    } catch (err) {
      console.error("Error creating parent:", err);
      alert("Error creating parent: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Parents */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Parents</h2>

          {/* Create Parent Form */}
          <form onSubmit={handleCreateParent} className="border rounded-xl bg-white p-5 mb-6 space-y-4">
            <h3 className="font-medium text-sm">Add New Parent</h3>

            <input
              type="text"
              placeholder="Parent Name"
              className="border rounded-md p-2 w-full text-sm"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="border rounded-md p-2 w-full text-sm"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="border rounded-md p-2 w-full text-sm"
              value={parentPassword}
              onChange={(e) => setParentPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm w-full"
            >
              {loading ? "Saving…" : "Add Parent"}
            </button>
          </form>

          {/* Parents List */}
          {parents.length === 0 ? (
            <p className="text-gray-500 text-sm">No parents added yet.</p>
          ) : (
            <div className="space-y-2">
              {parents.map((parent) => (
                <Link
                  key={parent._id}
                  href={`/teacher/parent/${parent._id}`}
                  className="block border rounded-lg bg-white p-3 transition hover:shadow-md hover:border-blue-400"
                >
                  <h4 className="font-medium text-sm">{parent.name}</h4>
                  <p className="text-xs text-gray-500">{parent.email}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Students */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Students</h2>

          {/* Create Student Form */}
          <form onSubmit={handleCreate} className="border rounded-xl bg-white p-5 mb-6 space-y-4">
            <h3 className="font-medium text-sm">Add New Student</h3>

            <input
              type="text"
              placeholder="Name"
              className="border rounded-md p-2 w-full text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Grade"
              className="border rounded-md p-2 w-full text-sm"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />

            <input
              type="text"
              placeholder="School"
              className="border rounded-md p-2 w-full text-sm"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />

            <input
              type="text"
              placeholder="Subjects (comma separated)"
              className="border rounded-md p-2 w-full text-sm"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />

            <select
              className="border rounded-md p-2 w-full text-sm"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Select Parent (optional)</option>
              {parents.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm w-full"
            >
              {loading ? "Saving…" : "Add Student"}
            </button>
          </form>

          {/* Students List */}
          {students.length === 0 ? (
            <p className="text-gray-500 text-sm">No students assigned.</p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <Link
                  key={student._id}
                  href={`/teacher/student/${student._id}`}
                  className="block border rounded-lg bg-white p-3 transition hover:shadow-md hover:border-blue-400"
                >
                  <h3 className="font-medium text-sm">{student.name}</h3>
                  <p className="text-xs text-gray-600">{student.grade} • {student.school}</p>
                  <p className="text-xs text-gray-500">
                    Parent: {student.parent?.name || "—"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
