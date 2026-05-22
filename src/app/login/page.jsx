"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errEmail, setErrEmail] = useState(false);

  async function doLogin() {
    // Reset status
    setErrorMsg("");
    setErrEmail(false);

    // 1. Validasi Client-side sederhana
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrEmail(true);
      return;
    }

    if (!password) {
      setErrorMsg("Password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // 2. Tentukan endpoint API berdasarkan domain email
      const isDoctor = email.endsWith("@qcare.com");
      const apiEndpoint = isDoctor ? "/api/doctor_login" : "/api/login";

      // 3. Panggil API Login yang sesuai
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login gagal");
      } else {
        // 4. Login Berhasil
        if (isDoctor) {
          // Simpan doctor data
          localStorage.setItem("doctor", JSON.stringify({
            id: data.doctor.id,
            name: data.doctor.name,
            email: data.doctor.email,
            specialty: data.doctor.specialty,
          }));
          localStorage.setItem("userType", "doctor");
        } else {
          // Simpan user data
          localStorage.setItem("user", JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
          }));
          localStorage.setItem("userType", "user");
        }
        
        alert("Login berhasil!");
        if (isDoctor){
          router.push("/doctor");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setErrorMsg("Gagal koneksi ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app auth">  {/* Add 'auth' class here */}
      <div className="page">
        <div className="auth-hero">
          <h2>Selamat datang kembali</h2>
          <p>Masuk untuk melihat atau membuat jadwal antrian anda.</p>
        </div>

        {/* Banner Error */}
        {errorMsg && (
          <div className="err-banner" style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
            {errorMsg}
          </div>
        )}

        {/* Input Email */}
        <div className="field">
          <label>Alamat email</label>
          <input
            type="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {errEmail && <p className="err">Format email tidak valid</p>}
        </div>

        {/* Input Password */}
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Masukkan password anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button 
          className="btn-pink" 
          onClick={doLogin} 
          disabled={loading}
        >
          {loading ? "Memproses..." : "Masuk ke akun"}
        </button>

        <div className="divider">
          <hr />
          <span>Belum punya akun?</span>
          <hr />
        </div>

        <button
          className="btn-outline"
          onClick={() => router.push("/register")}
          disabled={loading}
        >
          Buat akun baru
        </button>
      </div>
    </div>
  );
}