"use client";

import { useState } from "react";

export default function ParentModal({ isOpen, onClose, onSubmit, isLoading, isEditing, initialData }) {
  const defaultState = { name: "", email: "", password: "" };
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
        <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Parent" : "Add Parent"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Name" value={formData.name || ""} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="email" placeholder="Email" value={formData.email || ""} onChange={handleChange} className="w-full border p-2 rounded" required={!isEditing} />
          {!isEditing && <input name="password" placeholder="Password" value={formData.password || ""} onChange={handleChange} className="w-full border p-2 rounded" required />}
          <div className="flex gap-2">
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white p-2 rounded">{isLoading ? "Saving…" : isEditing ? "Update" : "Add"}</button>
            <button type="button" onClick={onClose} className="flex-1 border p-2 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
