"use client";

import { useState } from "react";
import ParentModal from "./ParentModal";
import StudentModal from "./StudentModal";
import ConfirmModal from "./ConfirmModal";
import ParentCard from "./ParentCard";
import StudentCard from "./StudentCard";

export default function TeacherDashboardClient({ initialStudents, initialParents }) {
  const [students, setStudents] = useState(initialStudents || []);
  const [parents, setParents] = useState(initialParents || []);
  const [loading, setLoading] = useState(false);

  // Modal state and keys (key forces remount so modals initialize from props)
  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [parentModalKey, setParentModalKey] = useState("parent-new");
  const [editingParent, setEditingParent] = useState(null);

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentModalKey, setStudentModalKey] = useState("student-new");
  const [editingStudent, setEditingStudent] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Parent handlers
  const openCreateParent = () => {
    setEditingParent(null);
    setParentModalKey(`new-${Date.now()}`);
    setParentModalOpen(true);
  };

  const openEditParent = (p) => {
    setEditingParent(p);
    setParentModalKey(`edit-${p._id}-${Date.now()}`);
    setParentModalOpen(true);
  };

  const handleSaveParent = async (formData) => {
    setLoading(true);
    try {
      const method = editingParent ? "PATCH" : "POST";
      const url = editingParent ? `/api/parents/${editingParent._id}` : "/api/parents";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Parent action failed"); return; }
      if (editingParent) setParents((s) => s.map((x) => x._id === data._id ? data : x)); else setParents((s) => [data, ...s]);
      setParentModalOpen(false);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const openDeleteParent = (p) => { setConfirmAction(p); setConfirmOpen(true); };
  const handleDeleteParent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parents/${confirmAction._id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) { const d = await res.json(); alert(d.error || "Delete failed"); return; }
      setParents((s) => s.filter((x) => x._id !== confirmAction._id));
      setConfirmOpen(false);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  // Student handlers
  const openCreateStudent = () => { setEditingStudent(null); setStudentModalKey(`new-${Date.now()}`); setStudentModalOpen(true); };
  const openEditStudent = (s) => {
    setEditingStudent({
      ...s,
      _id: s._id ? String(s._id) : s.id ? String(s.id) : "",
      subjects: Array.isArray(s.subjects) ? s.subjects.join(", ") : s.subjects || "",
      parentId: s.parent?._id || "",
    });
    setStudentModalKey(`edit-${s._id}-${Date.now()}`);
    setStudentModalOpen(true);
  };

  const handleSaveStudent = async (formData) => {
    setLoading(true);
    try {
      const method = editingStudent ? "PATCH" : "POST";
      // Prefer id from editingStudent, fallback to formData._id (trimmed)
      const rawId = (editingStudent && (editingStudent._id || editingStudent.id)) || formData._id || null;
      const id = rawId ? String(rawId).trim() : null;

      if (method === "PATCH") {
        if (!id || id.length === 0) {
          alert("Missing student id for update");
          return;
        }
        // Basic ObjectId format check (24 hex chars)
        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
          console.error("Invalid student id format:", id);
          alert("Invalid student id format. Please retry editing from the list.");
          return;
        }
      }

      const url = editingStudent ? `/api/students/${encodeURIComponent(id)}` : "/api/students";
      const payload = { name: formData.name, grade: formData.grade, school: formData.school, subjects: (formData.subjects || "").split(",").map(s=>s.trim()).filter(Boolean), parentId: formData.parentId || undefined };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Student action failed"); return; }
      if (editingStudent) setStudents((s) => s.map((x) => x._id === data._id ? data : x)); else setStudents((s) => [data, ...s]);
      setStudentModalOpen(false);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };
  const openDeleteStudent = (s) => { setConfirmAction(s); setConfirmOpen(true); };
  const handleDeleteStudent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${confirmAction._id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) { const d = await res.json(); alert(d.error || "Delete failed"); return; }
      setStudents((s) => s.filter((x) => x._id !== confirmAction._id)); setConfirmOpen(false);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Parents</h2>
            <button onClick={openCreateParent} className="bg-blue-600 text-white px-3 py-1 rounded">+ Add Parent</button>
          </div>
          {parents.length === 0 ? <p className="text-gray-500">No parents yet.</p> : <div className="space-y-3">{parents.map(p=> <ParentCard key={p._id} parent={p} onEdit={openEditParent} onDelete={openDeleteParent} />)}</div>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Students</h2>
            <button onClick={openCreateStudent} className="bg-blue-600 text-white px-3 py-1 rounded">+ Add Student</button>
          </div>
          {students.length === 0 ? <p className="text-gray-500">No students.</p> : <div className="space-y-3">{students.map(s=> <StudentCard key={s._id} student={s} onEdit={openEditStudent} onDelete={openDeleteStudent} />)}</div>}
        </div>
      </div>

      <ParentModal key={parentModalKey} isOpen={parentModalOpen} onClose={() => { setParentModalOpen(false); setEditingParent(null); }} onSubmit={handleSaveParent} isLoading={loading} isEditing={!!editingParent} initialData={editingParent || null} />

      <StudentModal key={studentModalKey} isOpen={studentModalOpen} onClose={() => { setStudentModalOpen(false); setEditingStudent(null); }} onSubmit={handleSaveStudent} isLoading={loading} isEditing={!!editingStudent} initialData={editingStudent || null} parents={parents || []} />

      <ConfirmModal isOpen={confirmOpen} onClose={() => { setConfirmOpen(false); setConfirmAction(null); }} onConfirm={confirmAction?.grade !== undefined ? handleDeleteStudent : handleDeleteParent} isLoading={loading} title="Confirm Deletion" message={`Are you sure you want to delete ${confirmAction?.name || "this item"}?`} />
    </section>
  );
}
