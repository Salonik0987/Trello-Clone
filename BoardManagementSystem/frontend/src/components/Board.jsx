import { useEffect, useState } from "react";
import API from "../api";
import List from "./List";
import BoardModal from "./BoardModal";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

export default function Board() {
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [cardsByList, setCardsByList] = useState({}); // { [listId]: Card[] }
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [title, setTitle] = useState("");
  const [listTitle, setListTitle] = useState("");
  const [editingBoard, setEditingBoard] = useState(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    const res = await API.get("/boards");
    setBoards(res.data);
  };

  const fetchCardsForList = async (listId) => {
    const res = await API.get(`/cards/${listId}`);
    setCardsByList((prev) => ({ ...prev, [listId]: res.data || [] }));
  };

  const fetchLists = async (boardId) => {
    const res = await API.get(`/lists/${boardId}`);
    const listsData = res.data;
    setLists(listsData);
    // Fetch cards for every list in parallel
    const entries = await Promise.all(
      listsData.map(async (l) => {
        const r = await API.get(`/cards/${l.id}`);
        return [l.id, r.data || []];
      })
    );
    setCardsByList(Object.fromEntries(entries));
  };

  const createBoard = async () => {
    if (!title.trim()) return;
    await API.post("/boards", { title });
    setTitle("");
    fetchBoards();
  };

  const createList = async () => {
    if (!listTitle.trim()) return;
    await API.post("/lists", {
      title: listTitle,
      board_id: selectedBoard,
      position: lists.length,
    });
    setListTitle("");
    fetchLists(selectedBoard);
  };

  // Called by BoardModal after a board is deleted — clear everything
  const handleBoardDeleted = () => {
    setSelectedBoard(null);
    setLists([]);
    setCardsByList({});
    fetchBoards();
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const srcId = source.droppableId;
    const dstId = destination.droppableId;

    // ── Optimistic reorder ──────────────────────────────────────────────────
    const srcCards = [...(cardsByList[srcId] || [])];
    const dstCards =
      srcId === dstId ? srcCards : [...(cardsByList[dstId] || [])];

    const [moved] = srcCards.splice(source.index, 1);

    if (srcId === dstId) {
      // Same list — just reinsert at new index
      srcCards.splice(destination.index, 0, moved);
      setCardsByList((prev) => ({
        ...prev,
        [srcId]: srcCards.map((c, i) => ({ ...c, position: i })),
      }));
    } else {
      // Cross-list
      dstCards.splice(destination.index, 0, {
        ...moved,
        list_id: Number(dstId),
      });
      setCardsByList((prev) => ({
        ...prev,
        [srcId]: srcCards.map((c, i) => ({ ...c, position: i })),
        [dstId]: dstCards.map((c, i) => ({ ...c, position: i })),
      }));
    }
    // ────────────────────────────────────────────────────────────────────────

    // Persist to backend (only the moved card needs updating)
    try {
      await API.put(`/cards/${draggableId}`, {
        list_id: dstId,
        position: destination.index,
      });
    } catch (error) {
      console.error("Error moving card:", error);
      fetchLists(selectedBoard); // rollback on failure
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 text-white p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Trello Clone</h1>
        <p className="text-blue-100">Manage your tasks with ease</p>
      </div>

      {/* Create Board */}
      <div className="mb-6 bg-blue-700 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Create New Board</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 text-black rounded border-2 border-blue-300 focus:outline-none focus:border-blue-500 placeholder-gray-600"
            placeholder="Enter board name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") createBoard();
            }}
          />
          <button
            onClick={createBoard}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold transition"
          >
            Create Board
          </button>
        </div>
      </div>

      {/* Board buttons */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Boards</h2>
        <div className="flex gap-3 flex-wrap">
          {boards.length === 0 ? (
            <p className="text-blue-200">No boards yet. Create one above!</p>
          ) : (
            boards.map((b) => (
              <div key={b.id} className="flex gap-1">
                <button
                  onClick={() => {
                    setSelectedBoard(b.id);
                    fetchLists(b.id);
                  }}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    selectedBoard === b.id
                      ? "bg-yellow-400 text-black"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {b.title}
                </button>
                <button
                  onClick={() => setEditingBoard(b)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
                  title="Edit board"
                >
                  ✎
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lists */}
      {selectedBoard && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Lists</h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 items-start">
              {lists.map((list) => (
                <Droppable droppableId={String(list.id)} key={list.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded transition ${
                        snapshot.isDraggingOver ? "bg-blue-500/20" : ""
                      }`}
                    >
                      <List
                        list={list}
                        cards={cardsByList[list.id] || []}
                        onCardChange={() => fetchCardsForList(list.id)}
                        onListChange={() => fetchLists(selectedBoard)}
                      />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}

              {/* Add List */}
              <div className="bg-blue-700 p-3 rounded w-64 flex-shrink-0 flex flex-col">
                <input
                  className="w-full px-2 py-2 mb-2 border-2 border-blue-300 rounded text-black placeholder-gray-600 focus:outline-none focus:border-yellow-400"
                  placeholder="Enter list name..."
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") createList();
                  }}
                />
                <button
                  onClick={createList}
                  className="bg-blue-500 hover:bg-blue-600 text-white w-full px-3 py-2 rounded font-semibold transition"
                >
                  Add List
                </button>
              </div>
            </div>
          </DragDropContext>
        </div>
      )}

      {editingBoard && (
        <BoardModal
          board={editingBoard}
          onClose={() => setEditingBoard(null)}
          refresh={fetchBoards}
          onDeleted={handleBoardDeleted}
        />
      )}
    </div>
  );
}