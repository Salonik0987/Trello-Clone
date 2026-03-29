import { useState, useEffect } from "react";
import API from "../api";

export default function CardModal({ card, onClose, refresh }) {
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(
    card.due_date ? card.due_date.slice(0, 10) : ""
  );

  const [checklistItems, setChecklistItems] = useState([]);
  const [newCheckItem, setNewCheckItem] = useState("");

  const [allLabels, setAllLabels] = useState([]);
  const [cardLabels, setCardLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  const [allMembers, setAllMembers] = useState([]);
  const [cardMembers, setCardMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [ciRes, alRes, clRes, amRes, cmRes] = await Promise.all([
        API.get(`/checklist/${card.id}`),
        API.get("/labels"),
        API.get(`/labels/card/${card.id}`),
        API.get("/members"),
        API.get(`/members/card/${card.id}`),
      ]);
      setChecklistItems(ciRes.data || []);
      setAllLabels(alRes.data || []);
      setCardLabels(clRes.data || []);
      setAllMembers(amRes.data || []);
      setCardMembers(cmRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Card save / delete ─────────────────────────────────────────────────────
  const saveCard = async () => {
    await API.put(`/cards/${card.id}`, {
      title,
      description,
      due_date: dueDate || null,
    });
    refresh();
    onClose();
  };

  const deleteCard = async () => {
    if (!window.confirm("Delete this card?")) return;
    await API.delete(`/cards/${card.id}`);
    refresh();
    onClose();
  };

  // ── Checklist ──────────────────────────────────────────────────────────────
  const refreshChecklist = async () => {
    const res = await API.get(`/checklist/${card.id}`);
    setChecklistItems(res.data || []);
  };

  const addCheckItem = async () => {
    if (!newCheckItem.trim()) return;
    await API.post("/checklist", { card_id: card.id, text: newCheckItem });
    setNewCheckItem("");
    refreshChecklist();
  };

  const toggleCheckItem = async (item) => {
    await API.put(`/checklist/${item.id}`, { completed: !item.completed });
    refreshChecklist();
  };

  const deleteCheckItem = async (id) => {
    await API.delete(`/checklist/${id}`);
    refreshChecklist();
  };

  // ── Labels ─────────────────────────────────────────────────────────────────
  const isLabelOn = (id) => cardLabels.some((l) => l.id === id);

  const toggleLabel = async (label) => {
    if (isLabelOn(label.id)) {
      await API.delete(`/labels/card/${card.id}/${label.id}`);
    } else {
      await API.post(`/labels/card/${card.id}`, { label_id: label.id });
    }
    const res = await API.get(`/labels/card/${card.id}`);
    setCardLabels(res.data);
  };

  const createLabel = async () => {
    if (!newLabelName.trim()) return;
    await API.post("/labels", { name: newLabelName, color: newLabelColor });
    setNewLabelName("");
    const res = await API.get("/labels");
    setAllLabels(res.data);
  };

  const deleteLabel = async (id) => {
    await API.delete(`/labels/${id}`);
    const [alRes, clRes] = await Promise.all([
      API.get("/labels"),
      API.get(`/labels/card/${card.id}`),
    ]);
    setAllLabels(alRes.data);
    setCardLabels(clRes.data);
  };

  // ── Members ────────────────────────────────────────────────────────────────
  const isMemberOn = (id) => cardMembers.some((m) => m.id === id);

  const toggleMember = async (member) => {
    if (isMemberOn(member.id)) {
      await API.delete(`/members/card/${card.id}/${member.id}`);
    } else {
      await API.post(`/members/card/${card.id}`, { member_id: member.id });
    }
    const res = await API.get(`/members/card/${card.id}`);
    setCardMembers(res.data);
  };

  const createMember = async () => {
    if (!newMemberName.trim()) return;
    await API.post("/members", { name: newMemberName });
    setNewMemberName("");
    const res = await API.get("/members");
    setAllMembers(res.data);
  };

  const deleteMember = async (id) => {
    await API.delete(`/members/${id}`);
    const [amRes, cmRes] = await Promise.all([
      API.get("/members"),
      API.get(`/members/card/${card.id}`),
    ]);
    setAllMembers(amRes.data);
    setCardMembers(cmRes.data);
  };

  // ── helpers ────────────────────────────────────────────────────────────────
  const done = checklistItems.filter((i) => i.completed).length;
  const total = checklistItems.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const isOverdue =
    dueDate &&
    new Date(dueDate) < new Date(new Date().toDateString());

  const PRESET_COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-8">
        {/* ── Header: title ── */}
        <div className="p-5 border-b border-gray-200">
          <input
            className="w-full text-xl font-bold text-black border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none pb-1 transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title…"
          />
        </div>

        {/* ── Body ── */}
        <div className="p-5 grid grid-cols-3 gap-6">
          {/* Left col: description + checklist */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <section>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Description
              </h4>
              <textarea
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-400 resize-none transition"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description…"
              />
            </section>

            {/* Checklist */}
            <section>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center gap-2">
                Checklist
                {total > 0 && (
                  <span className="font-normal normal-case text-gray-400">
                    {done}/{total}
                  </span>
                )}
              </h4>
              {total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pct === 100 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              <div className="space-y-2 mb-3">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={!!item.completed}
                      onChange={() => toggleCheckItem(item)}
                      className="w-4 h-4 cursor-pointer accent-blue-500 flex-shrink-0"
                    />
                    <span
                      className={`flex-1 text-sm text-black ${
                        item.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => deleteCheckItem(item.id)}
                      className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border-2 border-gray-200 rounded px-2 py-1 text-black text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Add an item…"
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addCheckItem();
                  }}
                />
                <button
                  onClick={addCheckItem}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                >
                  Add
                </button>
              </div>
            </section>
          </div>

          {/* Right col: due date + labels + members */}
          <div className="col-span-1 space-y-6">
            {/* Due Date */}
            <section>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Due Date
              </h4>
              <input
                type="date"
                className={`w-full border-2 rounded px-2 py-1.5 text-sm focus:outline-none transition ${
                  isOverdue
                    ? "border-red-400 text-red-600 bg-red-50"
                    : "border-gray-200 text-black focus:border-blue-400"
                }`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {isOverdue && (
                <p className="text-red-500 text-xs mt-1">⚠ Overdue</p>
              )}
            </section>

            {/* Labels */}
            <section>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Labels
              </h4>
              <div className="space-y-1.5 mb-3">
                {allLabels.map((label) => (
                  <div key={label.id} className="flex items-center gap-1">
                    <button
                      onClick={() => toggleLabel(label)}
                      className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium border-2 transition ${
                        isLabelOn(label.id)
                          ? "border-blue-400 bg-blue-50"
                          : "border-transparent bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-black truncate">{label.name}</span>
                      {isLabelOn(label.id) && (
                        <span className="ml-auto text-blue-500">✓</span>
                      )}
                    </button>
                    <button
                      onClick={() => deleteLabel(label.id)}
                      className="text-gray-300 hover:text-red-500 text-xs transition px-1"
                      title="Delete label"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {/* Create label */}
              <div className="border-t border-gray-200 pt-2 space-y-1.5">
                <input
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-black focus:outline-none focus:border-blue-400"
                  placeholder="New label name…"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") createLabel();
                  }}
                />
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewLabelColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        newLabelColor === c ? "border-gray-800 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={createLabel}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-black text-xs px-2 py-1 rounded transition font-semibold"
                >
                  + Create Label
                </button>
              </div>
            </section>

            {/* Members */}
            <section>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Members
              </h4>
              <div className="space-y-1.5 mb-3">
                {allMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-1">
                    <button
                      onClick={() => toggleMember(member)}
                      className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium border-2 transition ${
                        isMemberOn(member.id)
                          ? "border-blue-400 bg-blue-50"
                          : "border-transparent bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-black truncate">{member.name}</span>
                      {isMemberOn(member.id) && (
                        <span className="ml-auto text-blue-500">✓</span>
                      )}
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="text-gray-300 hover:text-red-500 text-xs transition px-1"
                      title="Delete member"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {/* Create member */}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex gap-1">
                  <input
                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs text-black focus:outline-none focus:border-blue-400"
                    placeholder="New member name…"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") createMember();
                    }}
                  />
                  <button
                    onClick={createMember}
                    className="bg-gray-100 hover:bg-gray-200 text-black text-xs px-2 py-1 rounded transition font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="p-5 border-t border-gray-200 flex gap-2">
          <button
            onClick={saveCard}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Save
          </button>
          <button
            onClick={deleteCard}
            className="flex-1 bg-red-500  hover:bg-red-600  text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}