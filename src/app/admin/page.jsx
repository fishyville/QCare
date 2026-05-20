"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminRegisterDoctor() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/doctor_register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: "success", message: "Akun Dokter berhasil didaftarkan!" });
        setFormData({ name: "", email: "", password: "", specialty: "" }); // Reset form
      } else {
        setStatus({ type: "error", message: result.error || "Gagal mendaftarkan dokter" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-gray-400 text-sm hover:text-rose-500 transition-colors mb-2 inline-block">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Registrasi Dokter</h1>
          <p className="text-gray-500 text-sm">Tambahkan praktisi baru ke sistem QCare</p>
        </div>

        {/* Notifikasi Status */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm border ${
            status.type === "success" 
            ? "bg-green-50 text-green-700 border-green-100" 
            : "bg-rose-50 text-rose-700 border-rose-100"
          }`}>
            {status.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 ml-1 mb-1.5 block">NAMA LENGKAP</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: dr. Adi Nugroho"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 ml-1 mb-1.5 block">EMAIL KANTOR</label>
            <input
              type="email"
              name="email"
              required
              placeholder="dokter@qcare.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 ml-1 mb-1.5 block">SPESIALISASI</label>
            <input
              type="text"
              name="specialty"
              placeholder="Contoh: Dokter Umum / Spesialis Anak"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 ml-1 mb-1.5 block">PASSWORD TEMPORER</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-full shadow-lg shadow-rose-100 transition-all active:scale-[0.98] disabled:bg-gray-300 mt-4"
          >
            {loading ? "Memproses..." : "Daftarkan Dokter"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-[10px] mt-8 tracking-widest uppercase font-bold">
          QCare Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}