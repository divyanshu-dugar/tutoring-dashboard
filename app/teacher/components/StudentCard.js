"use client";

import Link from "next/link";

export default function StudentCard({ student, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg bg-white p-4 flex items-start justify-between group hover:shadow-md transition">
      <Link href={`/teacher/student/${student._id}`} className="flex-1 block hover:text-blue-600">
        <h3 className="font-medium text-sm">{student.name}</h3>
        <p className="text-xs text-gray-600">{student.grade} • {student.school}</p>
        <p className="text-xs text-gray-500">Parent: {student.parent?.name || "—"}</p>
      </Link>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition ml-2">
        <button onClick={() => onEdit(student)} className="p-2 hover:bg-blue-50 rounded text-blue-600">✎</button>
        <button onClick={() => onDelete(student)} className="p-2 hover:bg-red-50 rounded text-red-600">🗑</button>
      </div>
    </div>
  );
}
