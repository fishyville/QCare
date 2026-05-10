"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import State from "../../lib/state";

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    State.load();
    if (!State.data.user) {
      router.push("/login");
      return;
    }
    setUser(State.data.user);
  }, []);

  function doLogout() {
    State.data.user = null;
    State.save();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="app">
      <div className="page">
        <div className="top-bar">
          <div>
            <h2>Selamat datang, {user.name}</h2>
            <p>{user.email}</p>
          </div>
          <button className="btn-danger" onClick={doLogout}>
            Logout
          </button>
        </div>

        <div className="card">
          <h3>Dashboard QCare</h3>
          <p>Sistem antrian digital untuk layanan kesehatan.</p>
          <p>Fitur utama akan segera hadir!</p>
        </div>
      </div>
    </div>
  );
}