"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import State from "../../lib/state";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    State.load();
    if (State.data.user) router.push("/app");
  }, []);

  function doLogin() {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError(true);
      return;
    }

    setError(false);

    State.load();

    const found = (State.data.users || []).find(
      (u) => u.email === email
    );

    if (!found) {
      alert("Akun belum terdaftar. Silakan daftar terlebih dahulu.");
      return;
    }

    State.data.user = found;
    State.save();

    router.push("/app");
  }

  return (
    <div className="app">
      <div className="page">

        <div className="auth-hero">
          <h2>Selamat datang kembali 👋</h2>
          <p>Masuk untuk melihat atau membuat jadwal antrian anda.</p>
        </div>

        <div className="field">
          <label>Alamat email</label>

          <input
            type="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <p className="err">Format email tidak valid</p>
          )}
        </div>

        <button className="btn-pink" onClick={doLogin}>
          Masuk ke akun
        </button>

        <p className="hint">
          Demo: hanya email yang sudah terdaftar bisa login
        </p>

        <div className="divider">
          <hr />
          <span>Belum punya akun?</span>
          <hr />
        </div>

        <button
          className="btn-outline"
          onClick={() => router.push("/register")}
        >
          Buat akun baru
        </button>

      </div>
    </div>
  );
}