import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = {
  nav: {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  brand: { color: "white", fontWeight: 700, fontSize: 20, textDecoration: "none" },
  links: { display: "flex", gap: 20, alignItems: "center" },
  link: { color: "rgba(255,255,255,0.9)", textDecoration: "none", fontSize: 14, fontWeight: 500 },
  user: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  btn: {
    background: "rgba(255,255,255,0.2)", color: "white", border: "none",
    padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 14,
  },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>🗂️ TaskManager</Link>
      {user && (
        <div style={styles.links}>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/projects" style={styles.link}>Projects</Link>
          <Link to="/tasks" style={styles.link}>My Tasks</Link>
          <span style={styles.user}>👤 {user.name} ({user.role})</span>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;