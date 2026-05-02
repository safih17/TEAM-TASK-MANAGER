import { useEffect, useState } from "react";
import api from "../api/axios";

const s = {
  page: { padding: 32 },
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 24, color: "#1e293b" },
  filters: { display: "flex", gap: 10, marginBottom: 24 },
  filterBtn: (active) => ({ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: active ? "#6366f1" : "#f1f5f9", color: active ? "white" : "#475569" }),
  section: { background: "white", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  th: { textAlign: "left", padding: "10px 14px", background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 600 },
  td: { padding: "12px 14px", borderTop: "1px solid #f1f5f9", fontSize: 14 },
};

const badge = (status) => {
  const map = { todo: ["#dbeafe", "#1d4ed8"], in_progress: ["#fef9c3", "#a16207"], done: ["#dcfce7", "#15803d"] };
  const [bg, color] = map[status] || ["#f1f5f9", "#475569"];
  return { background: bg, color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => api.get("/tasks/my").then(r => setTasks(r.data));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    load();
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={s.page}>
      <h1 style={s.h1}>My Tasks</h1>
      <div style={s.filters}>
        {["all", "todo", "in_progress", "done"].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div style={s.section}>
        {filtered.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>No tasks found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Task", "Project", "Status", "Due Date", "Update"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    {t.description && <div style={{ fontSize: 12, color: "#64748b" }}>{t.description}</div>}
                  </td>
                  <td style={s.td}>{t.project_name}</td>
                  <td style={s.td}><span style={badge(t.status)}>{t.status.replace("_", " ")}</span></td>
                  <td style={{ ...s.td, color: t.due_date && new Date(t.due_date) < new Date() && t.status !== "done" ? "#ef4444" : "#475569" }}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                  </td>
                  <td style={s.td}>
                    <select style={{ fontSize: 13, padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0" }}
                      value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Tasks;