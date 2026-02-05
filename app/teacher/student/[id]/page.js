"use client";

/**
 * Teacher Student Page
 * - View session history
 * - Create new sessions (with date, session notes, parent notes)
 * - Edit existing sessions inline
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherStudentPage() {
  const { id: studentId } = useParams();
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [date, setDate] = useState(today);
  const [sessionNotes, setSessionNotes] = useState("");
  const [parentNotes, setParentNotes] = useState("");
  const [homework, setHomework] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Load sessions
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/sessions?studentId=${studentId}`);
      const data = await res.json();
      setSessions(data);
      setLoading(false);
    }

    if (studentId) load();
  }, [studentId]);

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
        ← Back to students
      </button>

      <h2 className="text-2xl font-semibold mb-6">Student Sessions</h2>

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
                {new Date(s.date).toLocaleDateString()}
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
