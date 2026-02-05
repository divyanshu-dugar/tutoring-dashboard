// app/parent/student/[id]/page.jsx
// Student session history page
// - Client Component (uses router + effects)
// - Fetches sessions for a specific student
// - Displays latest session prominently

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ParentStudentPage() {
  const { id: studentId } = useParams();
  const router = useRouter();

  // Local UI state
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sessions once studentId is available
  useEffect(() => {
    if (!studentId) return;

    async function fetchSessions() {
      try {
        const res = await fetch(`/api/sessions?studentId=${studentId}`);
        if (!res.ok) throw new Error("Failed to fetch sessions");

        const data = await res.json();
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [studentId]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading sessions…
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  // Most recent session (API expected to return sorted list)
  const latestSession = sessions[0];

  return (
    <section className="p-6 max-w-4xl mx-auto">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back to students
      </button>

      <h2 className="text-2xl font-semibold mb-2">
        Student Sessions
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Total sessions: {sessions.length}
      </p>

      {/* Latest session highlight */}
      {latestSession ? (
        <div className="rounded-xl border bg-white p-5 mb-8">
          <h3 className="font-medium mb-3">
            Last Session –{" "}
            {new Date(latestSession.date).toLocaleDateString()}
          </h3>

          <div className="space-y-2 text-sm">
            {/* This is only for the teacher to see - reference for the teacher */}
            {/* <p>
              <span className="font-medium">Teacher Notes:</span>{" "}
              {latestSession.sessionNotes || "—"}
            </p> */}
            <p>
              <span className="font-medium">Session Notes:</span>{" "}
              {latestSession.parentNotes || "—"}
            </p>
            <p>
              <span className="font-medium">Homework:</span>{" "}
              {latestSession.homework || "—"}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
          No sessions found for this student.
        </div>
      )}

      {/* Previous sessions */}
      {sessions.length > 1 && (
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Previous Sessions</h3>

          {sessions.slice(1).map((session) => (
            <details
              key={session._id}
              className="rounded-lg border bg-white p-4"
            >
              <summary className="cursor-pointer font-medium text-sm">
                {new Date(session.date).toLocaleDateString()}
              </summary>

              <div className="mt-3 space-y-2 text-sm">
                {/* <p>
                  <span className="font-medium">Teacher Notes:</span>{" "}
                  {session.sessionNotes || "—"}
                </p> */}
                <p>
                  <span className="font-medium">Session Notes:</span>{" "}
                  {session.parentNotes || "—"}
                </p>
                <p>
                  <span className="font-medium">Homework:</span>{" "}
                  {session.homework || "—"}
                </p>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
