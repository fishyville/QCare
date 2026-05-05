"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
    if (!form.name || !form.email || !form.phone || !form.password) {
      return "Semua field harus diisi";
    }
    if (!form.email.includes("@")) {
      return "Email tidak valid";
    }
    if (form.password.length < 6) {
      return "Password minimal 6 karakter";
    }
    if (form.password !== form.confirmPassword) {
      return "Password tidak sama";
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

    try {
        const res = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
        }),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        } else {
        alert("Register berhasil!");
        window.location.href = "/login";
        }
    } catch (err) {
        setError("Gagal koneksi ke server");
    }

    setLoading(false);
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Daftar Akun
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Buat akun untuk mulai antrian
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAMA */}
          <div>
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama kamu"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium">No. Telepon</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
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
                placeholder="Minimal 6 karakter"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-sm font-medium">
              Konfirmasi Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
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
            className="w-full bg-red-600 text-red p-2 rounded-lg hover:bg-red-300 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Daftar"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="text-sm text-center mt-4">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}