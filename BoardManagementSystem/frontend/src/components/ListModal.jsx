import { useState } from "react";
import API from "../api/api";

export default function ListModal({ list, onClose, refresh }) {
  const [title, setTitle] = useState(list.title);
  const [loading, setLoading] = useState(false);

  const updateList = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await API.put(`/lists/${list.id}`, { title: title.trim() });
      refresh();
      onClose();
    } catch (e) {
      console.error("Error updating list:", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async () => {
    if (!window.confirm(`Delete list "${list.title}" and all its cards?`)) return;
    setLoading(true);
    try {
      await API.delete(`/lists/${list.id}`);
      refresh();
      onClose();
    } catch (e) {
      console.error("Error deleting list:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Edit List</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">
            List Name
          </label>
          <input
            autoFocus
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm font-semibold focus:outline-none focus:border-blue-500 transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && updateList()}
            placeholder="Enter list name…"
          />
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={updateList}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
          >
            Save
          </button>
          <button
            onClick={deleteList}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
          >
            Delete List
          </button>
        </div>
      </div>
    </div>
  );
}

