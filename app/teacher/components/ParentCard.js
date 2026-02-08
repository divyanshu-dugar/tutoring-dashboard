"use client";

import Link from "next/link";

export default function ParentCard({ parent, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg bg-white p-4 flex items-start justify-between group hover:shadow-md transition">
      <Link href={`/teacher/parent/${parent._id}`} className="flex-1 block hover:text-blue-600">
        <h4 className="font-medium text-sm">{parent.name}</h4>
        <p className="text-xs text-gray-500">{parent.email}</p>
      </Link>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition ml-2">
        <button onClick={() => onEdit(parent)} className="p-2 hover:bg-blue-50 rounded text-blue-600">✎</button>
        <button onClick={() => onDelete(parent)} className="p-2 hover:bg-red-50 rounded text-red-600">🗑</button>
      </div>
    </div>
  );
}
