import { useState } from "react";
import API from "../api";
import { Draggable } from "@hello-pangea/dnd";
import CardModal from "./CardModal";
import ListModal from "./ListModal";

// cards & refresh callbacks are now owned by Board (lifted state)
export default function List({ list, cards, onCardChange, onListChange }) {
  const [text, setText] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingList, setEditingList] = useState(null);

  const createCard = async () => {
    if (!text.trim()) return;
    try {
      await API.post("/cards", {
        text,
        list_id: list.id,
        position: cards.length,
      });
      setText("");
      onCardChange(); // tell Board to re-fetch this list's cards
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  return (
    <div className="bg-gray-200 p-4 rounded w-72 flex flex-col" style={{ maxHeight: "32rem" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-black font-bold text-lg truncate">{list.title}</h3>
        <button
          onClick={() => setEditingList(list)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm font-semibold ml-2 flex-shrink-0 transition"
          title="Edit list"
        >
          ✎
        </button>
      </div>

      {/* Cards — Draggables live here */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-2">
        {cards.length > 0 ? (
          cards.map((card, index) => {
            // Parse extra data coming from the enhanced GET query
            const labelColors = card.label_colors
              ? card.label_colors.split(",").filter(Boolean)
              : [];
            const memberCount    = Number(card.member_count    || 0);
            const checklistTotal = Number(card.checklist_total || 0);
            const checklistDone  = Number(card.checklist_done  || 0);

            const dueDateStr = card.due_date ? card.due_date.slice(0, 10) : null;
            const isOverdue  = dueDateStr && new Date(dueDateStr) < new Date(new Date().toDateString());

            return (
              <Draggable key={String(card.id)} draggableId={String(card.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => setSelectedCard(card)}
                    className={`bg-white p-3 rounded shadow cursor-pointer text-black border-l-4 border-blue-500 text-sm transition hover:shadow-md select-none ${
                      snapshot.isDragging ? "opacity-75 shadow-xl rotate-1" : ""
                    }`}
                  >
                    {/* Label color chips */}
                    {labelColors.length > 0 && (
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {labelColors.map((color, i) => (
                          <span
                            key={i}
                            className="inline-block h-2 w-8 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Card title */}
                    <p className="font-medium leading-snug">{card.title}</p>

                    {/* Bottom indicators */}
                    {(dueDateStr || checklistTotal > 0 || memberCount > 0) && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Due date */}
                        {dueDateStr && (
                          <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${
                            isOverdue
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            📅 {dueDateStr}
                          </span>
                        )}

                        {/* Checklist progress */}
                        {checklistTotal > 0 && (
                          <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${
                            checklistDone === checklistTotal
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            ✓ {checklistDone}/{checklistTotal}
                          </span>
                        )}

                        {/* Member count */}
                        {memberCount > 0 && (
                          <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                            👤 {memberCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            );
          })
        ) : (
          <p className="text-gray-400 text-center py-6 text-sm">No cards yet</p>
        )}
      </div>

      {/* Add Card */}
      <input
        className="w-full px-2 py-2 border-2 border-gray-300 rounded text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm mb-2"
        placeholder="Add a card..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => { if (e.key === "Enter") createCard(); }}
      />
      <button
        onClick={createCard}
        className="bg-green-500 hover:bg-green-600 w-full px-3 py-2 rounded font-semibold text-white text-sm transition"
      >
        + Add Card
      </button>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          refresh={onCardChange}
        />
      )}

      {editingList && (
        <ListModal
          list={editingList}
          onClose={() => setEditingList(null)}
          refresh={onListChange}
        />
      )}
    </div>
  );
}
