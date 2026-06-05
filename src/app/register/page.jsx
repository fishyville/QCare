"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // Form States
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telp, setTelp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Validation States (Visual Feedback)
  const [errNama, setErrNama] = useState(false);
  const [errEmail, setErrEmail] = useState(false);
  const [errTelp, setErrTelp] = useState(false);
  const [errPass, setErrPass] = useState(false);

  async function doRegister() {
    // Reset Errors
    setErrorMsg("");
    let ok = true;

    // 1. Client-side Validation Logic
    if (!nama) { setErrNama(true); ok = false; } else setErrNama(false);
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) { 
      setErrEmail(true); ok = false; 
    } else setErrEmail(false);

    if (!telp) { setErrTelp(true); ok = false; } else setErrTelp(false);

    if (password.length < 6 || password !== confirmPassword) {
      setErrPass(true);
      setErrorMsg(password !== confirmPassword ? "Password tidak sama" : "Password minimal 6 karakter");
      ok = false;
    } else setErrPass(false);

    if (!ok) return;

    // 2. API Request Logic
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nama,
          email: email,
          phone: telp,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registrasi gagal");
      } else {
        alert("Register berhasil!");
        router.push("/login");
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
          <h2>Buat akun baru</h2>
          <p>Daftarkan diri anda untuk mulai menggunakan layanan antrian digital.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && <div className="err-banner" style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}

        {/* Nama */}
        <div className="field">
          <label>Nama lengkap</label>
          <input
            type="text"
            placeholder="Contoh: Adi Budi"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            disabled={loading}
          />
          {errNama && <p className="err">Nama wajib diisi</p>}
        </div>

        {/* Email */}
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

        {/* Telepon */}
        <div className="field">
          <label>Nomor telepon</label>
          <input
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={telp}
            onChange={(e) => setTelp(e.target.value)}
            disabled={loading}
          />
          {errTelp && <p className="err">Nomor telepon wajib diisi</p>}
        </div>

        {/* Password */}
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Confirm Password */}
        <div className="field">
          <label>Konfirmasi Password</label>
          <input
            type="password"
            placeholder="Ulangi password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          {errPass && <p className="err">Periksa kembali password anda</p>}
        </div>

        {/* Submit */}
        <button 
          className="btn-pink" 
          onClick={doRegister}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Buat akun"}
        </button>

        <div className="divider">
          <hr />
          <span>Sudah punya akun?</span>
          <hr />
        </div>

        <button
          className="btn-outline"
          onClick={() => router.push("/login")}
          disabled={loading}
        >
          Masuk ke akun
        </button>
      </div>
    </div>
  );
}