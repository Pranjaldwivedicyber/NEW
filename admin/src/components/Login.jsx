import axios from "axios";
import React, { useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/user/admin`, { email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        // axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`; // optional global
      } else {
        toast.error(res.data?.message || "Login failed");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Login failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">Email Address</p>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none" type="email" placeholder="your@email.com" required />
          </div>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none" type="password" placeholder="Enter your password" required />
          </div>
          <button className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
