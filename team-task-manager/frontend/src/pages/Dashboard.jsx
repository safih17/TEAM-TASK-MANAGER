import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const s = {
  page: { padding: 32 },
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 4, color: "#1e293b" },
  sub: { color: "#64748b", marginBottom: 32 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, marginBottom: 36 },
  card: { background: "white", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  num: { fontSize: 40, fontWeight: 800 },
  cardLabel: { color: "#64748b", fontSize: 14, marginTop: 4 },
  section: { background: "white", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  th: { textAlign: "left", padding: "10px 14px", background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 600 },
  td: { padding: "12px 14px", borderTop: "1px solid #f1f5f9", fontSize: 14 },
};

const badge = (status) => {
  const map = { todo: ["#dbeafe", "#1d4ed8"], in_progress: ["#fef9c3", "#a16207"], done: ["#dcfce7", "#15803d"] };
  const [bg, color] = map[status] || ["#f1f5f9", "#475569"];
  return { background: bg, color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get("/tasks/stats").then(r => setStats(r.data));
    api.get("/tasks/my").then(r => setTasks(r.data));
  }, []);

  const statCards = stats ? [
    { label: "Total Tasks", value: stats.total, color: "#6366f1" },
    { label: "To Do", value: stats.todo, color: "#3b82f6" },
    { label: "In Progress", value: stats.in_progress, color: "#f59e0b" },
    { label: "Done", value: stats.done, color: "#10b981" },
    { label: "Overdue", value: stats.overdue, color: "#ef4444" },
  ] : [];

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Hello, {user?.name}! 👋</h1>
      <p style={s.sub}>Here's your task overview</p>

      <div style={s.grid}>
        {statCards.map(c => (
          <div key={c.label} style={{ ...s.card, borderTop: `4px solid ${c.color}` }}>
            <div style={{ ...s.num, color: c.color }}>{c.value ?? 0}</div>
            <div style={s.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>My Tasks</h2>
        {tasks.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>No tasks assigned to you yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Task", "Project", "Status", "Due Date"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td style={s.td}>{t.title}</td>
                  <td style={s.td}>{t.project_name}</td>
                  <td style={s.td}><span style={badge(t.status)}>{t.status.replace("_", " ")}</span></td>
                  <td style={{ ...s.td, color: t.due_date && new Date(t.due_date) < new Date() && t.status !== "done" ? "#ef4444" : "#475569" }}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
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

export default Dashboard;