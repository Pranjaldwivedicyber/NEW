import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { setToken } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/api/user/login`, { email, password });
      if (data?.success && data?.token) {
        setToken(data.token);
        navigate(from, { replace: true });    // ⬅️ back to /checkout if came from there
      } else {
        alert(data?.message || "Login failed");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      alert(msg);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ padding: 16, maxWidth: 420 }}>
      <h2>Login</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
