import { useState } from "react";
import API from "../api";

export default function ListModal({ list, onClose, refresh }) {
  const [title, setTitle] = useState(list.title);

  const updateList = async () => {
    try {
      if (!title.trim()) {
        alert("List name cannot be empty");
        return;
      }
      await API.put(`/lists/${list.id}`, { title });
      refresh();
      onClose();
    } catch (error) {
      console.error("Error updating list:", error);
      alert("Failed to update list");
    }
  };

  const deleteList = async () => {
    if (window.confirm(`Are you sure you want to delete "${list.title}"? This will delete all cards in it.`)) {
      try {
        await API.delete(`/lists/${list.id}`);
        refresh();
        onClose();
      } catch (error) {
        console.error("Error deleting list:", error);
        alert("Failed to delete list");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-2xl">
        <h2 className="text-xl font-bold text-black mb-4">Edit List</h2>

        <input
          className="w-full mb-4 border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500 font-semibold"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list name..."
          onKeyPress={(e) => {
            if (e.key === "Enter") updateList();
          }}
        />

        <div className="flex justify-between gap-2">
          <button
            onClick={updateList}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition"
          >
            Save
          </button>
          <button
            onClick={deleteList}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

