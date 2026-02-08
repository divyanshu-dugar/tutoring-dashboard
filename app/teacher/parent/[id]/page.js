"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherParentPage() {
  const { id: parentId } = useParams();
  const router = useRouter();
  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingStudent, setCreatingStudent] = useState(false);

  // Form state for creating new student
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [subjects, setSubjects] = useState("");

  // Load parent and students
  useEffect(() => {
    async function load() {
      try {
        // Fetch parent info
        const parentRes = await fetch(`/api/parents/${parentId}`);
        if (parentRes.ok) {
          const parentData = await parentRes.json();
          setParent(parentData);
        }

        // Fetch students for this parent
        const studentsRes = await fetch(`/api/students?role=parent&userId=${parentId}`);
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      } catch (err) {
        console.error("Error loading parent data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (parentId) load();
  }, [parentId]);

  async function handleCreateStudent(e) {
    e.preventDefault();
    setCreatingStudent(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName,
          grade,
          school,
          subjects: subjects.split(",").map((s) => s.trim()),
          parentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create student");

      const newStudent = await res.json();
      setStudents([newStudent, ...students]);

      // Reset form
      setStudentName("");
      setGrade("");
      setSchool("");
      setSubjects("");
    } catch (err) {
      console.error(err);
      alert("Error creating student");
    } finally {
      setCreatingStudent(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading…</p>;

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {parent && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">{parent.name}</h1>
          <p className="text-gray-600">{parent.email}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Add Student for {parent?.name}</h2>

      {/* Create Student Form */}
      <form onSubmit={handleCreateStudent} className="border rounded-xl bg-white p-5 mb-6 space-y-4">
        <input
          type="text"
          placeholder="Student Name"
          className="border rounded-md p-2 w-full text-sm"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
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

        <button
          type="submit"
          disabled={creatingStudent}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm w-full"
        >
          {creatingStudent ? "Adding…" : "Add Student"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Students</h2>

      {students.length === 0 ? (
        <p className="text-gray-500">No students assigned to this parent yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {students.map((student) => (
            <Link
              key={student._id}
              href={`/teacher/student/${student._id}`}
              className="rounded-xl border bg-white p-4 transition hover:shadow-md hover:border-blue-400"
            >
              <h3 className="font-medium text-lg">{student.name}</h3>
              <p className="text-sm text-gray-600">{student.grade}</p>
              <p className="text-sm text-gray-500">{student.school}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
