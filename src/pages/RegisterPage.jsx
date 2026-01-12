import React, { useState } from "react";
import { useRegisterAdminMutation } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [registerAdmin, { isLoading }] = useRegisterAdminMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerAdmin(form).unwrap();
      alert("✅ Admin registered successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      alert(err?.data?.message || "Registration failed");
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
          Admin Registration
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Create an account to access the system
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition 
              ${isLoading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
