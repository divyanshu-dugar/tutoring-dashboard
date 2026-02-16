"use client";

/**
 * Teacher Student Page
 * - View student details and parent
 * - Change parent assignment
 * - View session history
 * - Create new sessions (with date, session notes, parent notes)
 * - Edit existing sessions inline
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherStudentPage() {
  const { id: studentId } = useParams();
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [student, setStudent] = useState(null);
  const [parents, setParents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingParents, setLoadingParents] = useState(false);
  const [updatingParent, setUpdatingParent] = useState(false);

  // Create form state
  const [date, setDate] = useState(today);
  const [sessionNotes, setSessionNotes] = useState("");
  const [parentNotes, setParentNotes] = useState("");
  const [homework, setHomework] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Parent state
  const [selectedParentId, setSelectedParentId] = useState("");

  // Load student, parents, and sessions
  useEffect(() => {
    async function load() {
      try {
        // Load student details
        const studentRes = await fetch(`/api/students/${studentId}`);
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudent(studentData);
          setSelectedParentId(studentData.parent?._id || "");
        }

        // Load parents
        const parentsRes = await fetch("/api/parents");
        if (parentsRes.ok) {
          const parentsData = await parentsRes.json();
          setParents(parentsData);
        }

        // Load sessions
        const sessionsRes = await fetch(`/api/sessions?studentId=${studentId}`);
        const sessionsData = await sessionsRes.ok ? await sessionsRes.json() : [];
        setSessions(sessionsData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (studentId) load();
  }, [studentId]);

  // Update parent assignment
  async function handleUpdateParent(e) {
    e.preventDefault();
    setUpdatingParent(true);

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: selectedParentId || null }),
      });

      if (!res.ok) throw new Error("Failed to update parent");

      const updatedStudent = await res.json();
      setStudent(updatedStudent);
    } catch (err) {
      console.error(err);
      alert("Error updating parent");
    } finally {
      setUpdatingParent(false);
    }
  }

  // Create session
  async function handleCreate(e) {
    e.preventDefault();

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        date,
        sessionNotes,
        parentNotes,
        homework,
      }),
    });

    const newSession = await res.json();
    setSessions([newSession, ...sessions]);

    // Reset form
    setDate(today);
    setSessionNotes("");
    setParentNotes("");
    setHomework("");
  }

  // Start edit
  function startEdit(session) {
    setEditingId(session._id);
    setEditData({
      date: session.date.split("T")[0],
      sessionNotes: session.sessionNotes || "",
      parentNotes: session.parentNotes || "",
      homework: session.homework || "",
    });
  }

  // Save edit
  async function saveEdit() {
    const res = await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: editingId,
        ...editData,
      }),
    });

    const updated = await res.json();

    setSessions(sessions.map((s) => (s._id === updated._id ? updated : s)));

    setEditingId(null);
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }

  return (
    <section className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {student && (
        <div className="mb-8 border rounded-xl bg-white p-5">
          <h1 className="text-2xl font-semibold mb-4">{student.name}</h1>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Grade</p>
              <p className="text-gray-600">{student.grade || "—"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">School</p>
              <p className="text-gray-600">{student.school || "—"}</p>
            </div>
          </div>

          {/* Parent Assignment Section */}
          <form onSubmit={handleUpdateParent} className="space-y-3 pt-4 border-t">
            <label className="block">
              <p className="font-medium text-gray-700 text-sm mb-2">Assigned Parent</p>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="border rounded-md p-2 w-full text-sm"
              >
                <option value="">No parent assigned</option>
                {parents.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name} ({parent.email})
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatingParent}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                {updatingParent ? "Updating…" : "Update Parent"}
              </button>
              {student.parent && (
                <Link
                  href={`/teacher/parent/${student.parent._id}`}
                  className="text-blue-600 text-sm hover:underline py-2"
                >
                  View Parent
                </Link>
              )}
            </div>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">Sessions</h2>

      {/* Create Session */}
      <form
        onSubmit={handleCreate}
        className="border rounded-xl bg-white p-5 mb-8 space-y-4"
      >
        <h3 className="font-medium">Add New Session</h3>

        <input
          type="date"
          className="border rounded-md p-2 text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <textarea
          className="border rounded-md p-2 text-sm w-full"
          rows={3}
          placeholder="Session notes"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          required
        />

        <textarea
          className="border rounded-md p-2 text-sm w-full"
          rows={3}
          placeholder="Parent notes"
          value={parentNotes}
          onChange={(e) => setParentNotes(e.target.value)}
        />

        <textarea
          className="border rounded-md p-2 text-sm w-full"
          rows={2}
          placeholder="Homework"
          value={homework}
          onChange={(e) => setHomework(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          Save Session
        </button>
      </form>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((s, index) => (
          <div
            key={s._id?.toString() || `session-${index}`}
            className="border rounded-lg bg-white p-4 text-sm"
          >
            <div className="flex justify-between mb-2">
              <p className="font-medium">
                {new Date(s.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
              </p>
              {editingId !== s._id && (
                <button
                  onClick={() => startEdit(s)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editingId === s._id ? (
              <div className="space-y-2">
                <input
                  type="date"
                  className="border rounded-md p-2 text-sm"
                  value={editData.date}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                />

                <textarea
                  className="border rounded-md p-2 w-full"
                  rows={3}
                  value={editData.sessionNotes}
                  onChange={(e) =>
                    setEditData({ ...editData, sessionNotes: e.target.value })
                  }
                />

                <textarea
                  className="border rounded-md p-2 w-full"
                  rows={3}
                  value={editData.parentNotes}
                  onChange={(e) =>
                    setEditData({ ...editData, parentNotes: e.target.value })
                  }
                />

                <textarea
                  className="border rounded-md p-2 w-full"
                  rows={2}
                  value={editData.homework}
                  onChange={(e) =>
                    setEditData({ ...editData, homework: e.target.value })
                  }
                />

                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-500 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>
                  <strong>Session:</strong> {s.sessionNotes}
                </p>
                <p>
                  <strong>Parent:</strong> {s.parentNotes || "—"}
                </p>
                <p>
                  <strong>Homework:</strong> {s.homework || "—"}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
