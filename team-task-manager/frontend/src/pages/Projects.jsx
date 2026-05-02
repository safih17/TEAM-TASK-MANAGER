import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const s = {
  page: { padding: 32 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  h1: { fontSize: 26, fontWeight: 700, color: "#1e293b" },
  btn: { padding: "9px 20px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 },
  card: { background: "white", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textDecoration: "none", color: "inherit", display: "block", transition: "transform 0.15s" },
  name: { fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#1e293b" },
  desc: { color: "#64748b", fontSize: 14, marginBottom: 14 },
  meta: { fontSize: 12, color: "#94a3b8" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  mcard: { background: "white", padding: 32, borderRadius: 16, width: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 14 },
  label: { display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#374151" },
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = () => api.get("/projects").then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/projects", form);
    setForm({ name: "", description: "" });
    setShowModal(false);
    load();
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.h1}>Projects</h1>
        {user?.role === "admin" && (
          <button style={s.btn} onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 60 }}>No projects found.</p>
      ) : (
        <div style={s.grid}>
          {projects.map(p => (
            <Link to={`/projects/${p.id}`} key={p.id} style={s.card}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <div style={s.name}>📁 {p.name}</div>
              <div style={s.desc}>{p.description || "No description"}</div>
              <div style={s.meta}>Admin: {p.admin_name} • {new Date(p.created_at).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div style={s.modal} onClick={() => setShowModal(false)}>
          <div style={s.mcard} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700 }}>New Project</h2>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Project Name</label>
              <input style={s.input} value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
              <label style={s.label}>Description</label>
              <textarea style={{ ...s.input, height: 80, resize: "vertical" }} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={s.btn}>Create</button>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ ...s.btn, background: "#f1f5f9", color: "#475569" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;