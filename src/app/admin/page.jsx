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
    <div className="app">
      <div className="page">
        <Link href="/dashboard" className="back-btn">
          ← Kembali ke Dashboard
        </Link>
        
        <div className="auth-hero">
          <h2>Registrasi Dokter</h2>
          <p>Tambahkan praktisi baru ke sistem QCare</p>
        </div>

        {/* Status notification */}
        {status.message && (
          <div className="err-banner" style={{
            color: status.type === "success" ? "green" : "red",
            marginBottom: "10px",
            fontSize: "14px"
          }}>
            {status.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>NAMA LENGKAP</label>
            <input
              type="text"
              name="name"
              placeholder="Contoh: dr. Adi Nugroho"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>EMAIL KANTOR</label>
            <input
              type="email"
              name="email"
              placeholder="dokter@qcare.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>SPESIALISASI</label>
            <input
              type="text"
              name="specialty"
              placeholder="Contoh: Dokter Umum / Spesialis Anak"
              value={formData.specialty}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>PASSWORD TEMPORER</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button className="btn-pink" disabled={loading}>
            {loading ? "Memproses..." : "Daftarkan Dokter"}
          </button>
        </form>
      </div>
    </div>
  );
}