import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" },
  card: { background: "white", padding: 40, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", width: 380 },
  h2: { marginBottom: 8, fontSize: 24, fontWeight: 700, color: "#1e293b" },
  sub: { color: "#64748b", marginBottom: 28, fontSize: 14 },
  label: { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 16, outline: "none" },
  btn: { width: "100%", padding: "11px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  err: { color: "#ef4444", fontSize: 13, marginBottom: 12 },
  link: { display: "block", textAlign: "center", marginTop: 16, fontSize: 13, color: "#6366f1" },
};

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.h2}>Welcome back 👋</h2>
        <p style={s.sub}>Login to your account</p>
        {error && <p style={s.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={s.btn} type="submit">Login</button>
        </form>
        <Link to="/register" style={s.link}>Don't have an account? Register</Link>
      </div>
    </div>
  );
};

export default Login;