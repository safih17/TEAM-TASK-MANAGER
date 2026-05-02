import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const s = {
  page: { padding: 32 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  h1: { fontSize: 24, fontWeight: 700, color: "#1e293b" },
  desc: { color: "#64748b", marginTop: 4, fontSize: 14 },
  btn: { padding: "8px 18px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  dangerBtn: { padding: "8px 18px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  section: { background: "white", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  sectionH: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1e293b" },
  taskCard: { padding: "12px 16px", borderRadius: 10, border: "1.5px solid #f1f5f9", marginBottom: 10 },
  taskTitle: { fontWeight: 600, fontSize: 14, marginBottom: 4 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  mcard: { background: "white", padding: 32, borderRadius: 16, width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 14 },
  label: { display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#374151" },
};

const badge = (status) => {
  const map = { todo: ["#dbeafe", "#1d4ed8"], in_progress: ["#fef9c3", "#a16207"], done: ["#dcfce7", "#15803d"] };
  const [bg, color] = map[status] || ["#f1f5f9", "#475569"];
  return { background: bg, color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 };
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", assigned_to: "" });
  const [editTask, setEditTask] = useState(null);

  const loadProject = () => api.get(`/projects/${id}`).then(r => setProject(r.data));
  const loadTasks = () => api.get(`/tasks/project/${id}`).then(r => setTasks(r.data));

  useEffect(() => {
    loadProject();
    loadTasks();
    if (user?.role === "admin") api.get("/users").then(r => setAllUsers(r.data));
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await api.post("/tasks", { ...taskForm, project_id: id });
    setTaskForm({ title: "", description: "", due_date: "", assigned_to: "" });
    setShowTaskModal(false);
    loadTasks();
  };

  const handleUpdateTask = async (taskId, newStatus) => {
    await api.put(`/tasks/${taskId}`, { status: newStatus });
    loadTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      await api.delete(`/tasks/${taskId}`);
      loadTasks();
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Delete this project and all its tasks?")) {
      await api.delete(`/projects/${id}`);
      navigate("/projects");
    }
  };

  const handleAddMember = async (userId) => {
    await api.post(`/projects/${id}/members`, { userId });
    loadProject();
  };

  const handleRemoveMember = async (userId) => {
    await api.delete(`/projects/${id}/members/${userId}`);
    loadProject();
  };

  if (!project) return <div style={{ padding: 40 }}>Loading...</div>;

  const memberIds = project.members?.map(m => m.id) || [];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>📁 {project.name}</h1>
          <p style={s.desc}>{project.description}</p>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Admin: {project.admin_name}</p>
        </div>
        {user?.role === "admin" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button style={s.btn} onClick={() => setShowTaskModal(true)}>+ Add Task</button>
            <button style={s.dangerBtn} onClick={handleDeleteProject}>Delete Project</button>
          </div>
        )}
      </div>

      <div style={s.grid}>
        {/* TASKS */}
        <div style={s.section}>
          <h2 style={s.sectionH}>Tasks ({tasks.length})</h2>
          {tasks.length === 0 && <p style={{ color: "#94a3b8", fontSize: 14 }}>No tasks yet.</p>}
          {tasks.map(t => (
            <div key={t.id} style={s.taskCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={s.taskTitle}>{t.title}</div>
                  {t.description && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{t.description}</div>}
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Assigned: {t.assigned_name || "Unassigned"} •{" "}
                    {t.due_date ? `Due: ${new Date(t.due_date).toLocaleDateString()}` : "No due date"}
                  </div>
                </div>
                <span style={badge(t.status)}>{t.status.replace("_", " ")}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <select style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}
                  value={t.status} onChange={e => handleUpdateTask(t.id, e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {user?.role === "admin" && (
                  <button onClick={() => handleDeleteTask(t.id)}
                    style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer" }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MEMBERS */}
        <div style={s.section}>
          <h2 style={s.sectionH}>Members ({project.members?.length || 0})</h2>
          {project.members?.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.email} • {m.role}</div>
              </div>
              {user?.role === "admin" && m.id !== project.admin_id && (
                <button onClick={() => handleRemoveMember(m.id)}
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer" }}>
                  Remove
                </button>
              )}
            </div>
          ))}

          {user?.role === "admin" && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#374151" }}>Add Member</h3>
              {allUsers.filter(u => !memberIds.includes(u.id)).map(u => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: 13 }}>{u.name} ({u.role})</span>
                  <button onClick={() => handleAddMember(u.id)}
                    style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#ede9fe", color: "#6366f1", border: "none", cursor: "pointer" }}>
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div style={s.modal} onClick={() => setShowTaskModal(false)}>
          <div style={s.mcard} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700 }}>New Task</h2>
            <form onSubmit={handleCreateTask}>
              <label style={s.label}>Title</label>
              <input style={s.input} value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              <label style={s.label}>Description</label>
              <textarea style={{ ...s.input, height: 70, resize: "vertical" }} value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              <label style={s.label}>Due Date</label>
              <input style={s.input} type="date" value={taskForm.due_date}
                onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
              <label style={s.label}>Assign To</label>
              <select style={s.input} value={taskForm.assigned_to}
                onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                <option value="">-- Unassigned --</option>
                {project.members?.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={s.btn}>Create Task</button>
                <button type="button" onClick={() => setShowTaskModal(false)}
                  style={{ ...s.btn, background: "#f1f5f9", color: "#475569" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;