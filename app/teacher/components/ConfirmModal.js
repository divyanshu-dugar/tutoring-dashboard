"use client";

export default function ConfirmModal({ isOpen, onClose, onConfirm, isLoading, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 bg-red-600 text-white p-2 rounded">{isLoading ? "Deleting…" : "Delete"}</button>
          <button onClick={onClose} className="flex-1 border p-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
