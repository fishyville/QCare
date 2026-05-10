"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import State from "../../lib/state";

export default function RegisterPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telp, setTelp] = useState("");

  const [errNama, setErrNama] = useState(false);
  const [errEmail, setErrEmail] = useState(false);
  const [errTelp, setErrTelp] = useState(false);

  useEffect(() => {
    State.load();
  }, []);

  function doRegister() {
    let ok = true;

    if (!nama) {
      setErrNama(true);
      ok = false;
    } else setErrNama(false);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrEmail(true);
      ok = false;
    } else setErrEmail(false);

    if (!telp) {
      setErrTelp(true);
      ok = false;
    } else setErrTelp(false);

    if (!ok) return;

    State.load();
    State.data.users = State.data.users || [];

    const exists = State.data.users.find(
      (u) => u.email === email
    );

    if (exists) {
      alert("Email sudah terdaftar");
      return;
    }

    const newUser = {
      name: nama,
      email,
      phone: telp,
    };

    State.data.users.push(newUser);
    State.data.user = newUser;

    State.save();

    router.push("/app");
  }

  return (
    <div className="app">
      <div className="page">

        <div className="auth-hero">
          <h2>Buat akun baru ✨</h2>
          <p>
            Daftarkan diri anda untuk mulai menggunakan layanan antrian digital.
          </p>
        </div>

        {/* Nama */}
        <div className="field">
          <label>Nama lengkap</label>
          <input
            type="text"
            placeholder="Contoh: Adi Budi"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          {errNama && (
            <p className="err">Nama wajib diisi</p>
          )}
        </div>

        {/* Email */}
        <div className="field">
          <label>Alamat email</label>
          <input
            type="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errEmail && (
            <p className="err">Format email tidak valid</p>
          )}
        </div>

        {/* Telepon */}
        <div className="field">
          <label>Nomor telepon</label>
          <input
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={telp}
            onChange={(e) => setTelp(e.target.value)}
          />
          {errTelp && (
            <p className="err">Nomor telepon wajib diisi</p>
          )}
        </div>

        {/* Submit */}
        <button className="btn-pink" onClick={doRegister}>
          Buat akun
        </button>

        <p className="hint">
          Demo: isi semua field untuk mendaftar
        </p>

        <div className="divider">
          <hr />
          <span>Sudah punya akun?</span>
          <hr />
        </div>

        <button
          className="btn-outline"
          onClick={() => router.push("/login")}
        >
          Masuk ke akun
        </button>

      </div>
    </div>
  );
}