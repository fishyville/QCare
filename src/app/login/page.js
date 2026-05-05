"use client";

import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function validate() {
    if (!form.email || !form.password) {
      return "Semua field harus diisi";
    }
    if (!form.email.includes("@")) {
      return "Email tidak valid";
    }
    if (form.password.length < 6) {
      return "Password minimal 6 karakter";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // SIMULASI REQUEST (nanti ganti API)
    setTimeout(() => {
      setLoading(false);
      alert("Login success (dummy)");
    }, 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Login Klinik
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Masuk untuk melanjutkan
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="text-sm text-center mt-4">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600 font-medium">
            Daftar
          </a>
        </p>
      </div>
    </div>
  );
}