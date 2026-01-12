import React, { useState } from "react";
import { useLoginMutation } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../api/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    // console.log("user credentials" , )

    e.preventDefault();
    try {
      console.log("Login credentials:", form);
      // await login(credentials).unwrap();

      const res = await login(form).unwrap();
      dispatch(setCredentials(res));

      // handle optional redirect (e.g., incoming emails link to `/login?next=...`)
      const params = new URLSearchParams(location.search);
      const next = params.get('next');
      if (next && next.startsWith('/')) {
        navigate(next);
        return;
      }

      // Get role from API response and fallback routing
      const role = res?.user?.role?.toLowerCase();

      // Role-based routing
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "cochecker":
          navigate("/cochecker");
          break;
        case "rm":
          navigate("/rm");
          break;
        case "cocreator":
          navigate("/cocreator");
          break;
        case "approver":
          navigate("/approver");
          break;
        default:
          navigate("/register"); // fallback
          break;
      }
    } catch (err) {
      alert(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <FiCheckCircle className="text-blue-600" size={32} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-gray-800">
          Document Checklist System
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Secure access for authorized personnel
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-6">
          Dont have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
