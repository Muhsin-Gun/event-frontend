// src/Components/Register.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "client", // default role
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("/api/auth/register", form);

      if (res.data.success) {
        const { user, token } = res.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", user.role);

        setMessage({ type: "success", text: "Registration successful!" });

        // redirect based on role
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "employee") navigate("/employee");
        else navigate("/client");
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Registration failed",
        });
      }
    } catch (err) {
      console.error("Register error", err);
      setMessage({
        type: "error",
        text: "Network or server error. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        background: "#121212",
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1f1f2e",
          borderRadius: 12,
          padding: 36,
          width: "100%",
          maxWidth: 520,
          border: "1px solid #333",
        }}
      >
        <h2
          style={{
            color: "#ffb703",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Register
        </h2>

        {message && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              background:
                message.type === "success" ? "#0b2b13" : "#3b0f0f",
              color: message.type === "success" ? "#ccffd8" : "#ffd1d1",
              border:
                message.type === "success"
                  ? "1px solid rgba(18,183,103,.12)"
                  : "1px solid rgba(255,59,59,.12)",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "grid", gap: 12 }}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              style={inputStyle()}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle()}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle()}
            />
          </label>

          <label>
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={inputStyle()}
            >
              <option value="client">Client</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#555" : "#ff3b3b",
              color: loading ? "#999" : "#fff",
              border: "none",
              padding: "12px",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing up..." : `Sign Up`}
          </button>
        </form>
      </div>
    </section>
  );
}

function inputStyle() {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    background: "#333",
    border: "1px solid #555",
    color: "#fff",
    marginTop: 6,
    boxSizing: "border-box",
  };
}
