"use client";

import { useState } from "react";

export default function StudentModal({ isOpen, onClose, onSubmit, isLoading, isEditing, initialData, parents }) {
  const defaultState = { name: "", grade: "", school: "", subjects: "", parentId: "", _id: "" };
  const [formData, setFormData] = useState(() => initialData || defaultState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Student" : "Add Student"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Name" value={formData.name || ""} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="grade" placeholder="Grade" value={formData.grade || ""} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="school" placeholder="School" value={formData.school || ""} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="subjects" placeholder="Subjects (comma separated)" value={formData.subjects || ""} onChange={handleChange} className="w-full border p-2 rounded" />
          <select name="parentId" value={formData.parentId || ""} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Parent (optional)</option>
            {parents.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white p-2 rounded">{isLoading ? "Saving…" : isEditing ? "Update" : "Add"}</button>
            <button type="button" onClick={onClose} className="flex-1 border p-2 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
