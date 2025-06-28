"use client";

import { X } from "lucide-react";

export function TaskDetailModal({
  taskId,
  onClose,
}: {
  taskId: string | number | null;
  onClose: () => void;
}) {
  if (!taskId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Task Details</h2>
        <p className="text-gray-700">Task ID: {taskId}</p>
        <p className="text-gray-500 mt-2">This is a placeholder modal. Add details here!</p>
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
