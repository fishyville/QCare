"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_CONFIG = {
  WAITING:   { label: "Waiting",   bg: "#FAEEDA", color: "#633806" },
  ONGOING:   { label: "Ongoing",   bg: "#EEEDFE", color: "#3C3489" },
  DONE:      { label: "Done",      bg: "#EAF3DE", color: "#27500A" },
  CANCELLED: { label: "Cancelled", bg: "#FCEBEB", color: "#791F1F" },
};

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "#F1EFE8", color: "#444" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 500,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [successId, setSuccessId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();
        
        if (result.success) {
          setAppointments(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    // Ambil user dari localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const filtered = appointments.filter((apt) => {
    const q = search.toLowerCase();
    const matchSearch = apt.id.toLowerCase().includes(q) || apt.description.toLowerCase().includes(q);
    const matchStatus = !filterStatus || apt.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    waiting: appointments.filter((a) => a.status === "WAITING").length,
    ongoing: appointments.filter((a) => a.status === "ONGOING").length,
    total:   appointments.length,
  };

  const handleAddAppointment = async () => {
    if (!description) {
      alert("Deskripsi harus diisi");
      return;
    }
    
    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description,
          userId: user?.id, // Auto-fill dari localStorage
          booking: document.querySelector('input[type="datetime-local"]').value,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessId(result.data.id);
        setDescription("");
        setShowModal(false);
        // Refresh appointments
        const refreshRes = await fetch("/api/dashboard");
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setAppointments(refreshData.data);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal membuat antrian");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F1EFE8" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 210, background: "white", flexShrink: 0,
        borderRight: "0.5px solid rgba(0,0,0,0.08)",
        padding: "22px 14px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 26 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#D4537E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HeartbeatIcon />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Q-Care</span>
        </div>

        <NavBtn active icon={<DashboardIcon />} label="Dashboard" />
        <NavBtn icon={<ChartIcon />} label="Laporan" />
        <NavBtn icon={<InfoIcon />} label="About us" onClick={() => router.push("/about")} />

        <div style={{ flex: 1 }} />

        <NavBtn icon={<SettingsIcon />} label="Pengaturan" />
        <NavBtn icon={<LogoutIcon />} label="Keluar" />
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "26px 26px 20px", display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, borderBottom: "2.5px solid #D4537E", paddingBottom: 3 }}>
            Dashboard antrian
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconButton title="Notifikasi"><BellIcon /></IconButton>
            <IconButton title="Refresh"><RefreshIcon /></IconButton>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: "white", border: "0.5px solid rgba(0,0,0,0.1)" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FBEAF0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#993556" }}>
                {user?.name?.charAt(0).toUpperCase() || "NA"}
              </div>
              <span style={{ fontSize: 13, color: "#666" }}>{user?.name || "Nama akun"}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <StatCard dot="#BA7517" label="Waiting" value={counts.waiting} sub="Menunggu dipanggil" />
          <StatCard dot="#7F77DD" label="Ongoing" value={counts.ongoing} sub="Sedang dilayani" />
          <StatCard dot="#D4537E" label="Total antrian" value={counts.total} sub="Hari ini" />
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa", pointerEvents: "none" }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Cari no. antrian atau keluhan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", fontSize: 13, background: "white", outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", fontSize: 13, background: "white", fontFamily: "inherit", outline: "none", cursor: "pointer" }}
          >
            <option value="">Semua status</option>
            <option value="WAITING">Waiting</option>
            <option value="ONGOING">Ongoing</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "#D4537E", color: "white", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
          >
            + Tambah antrian
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: 12, border: "0.5px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Daftar antrian</span>
            <span style={{ fontSize: 12, color: "#999" }}>{filtered.length} antrian</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                {[["No. antrian", 110], ["Keluhan", null], ["Status", 120], ["Booking", 120], ["Est. waktu", 120]].map(([h, w]) => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", width: w || undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((apt) => (
                <tr key={apt.id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#999" }}>{apt.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{apt.description}</td>
                  <td style={{ padding: "12px 16px" }}><Badge status={apt.status} /></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{apt.booking || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{apt.estimasi || "—"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "48px", color: "#bbb", fontSize: 13 }}>
                    Tidak ada antrian ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Success Modal */}
      {successId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "white", borderRadius: 12, padding: "32px", textAlign: "center", maxWidth: 400 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Antrian Berhasil Dibuat</h2>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Nomor antrian Anda:</p>
            <div style={{ background: "#FAEEDA", padding: "24px", borderRadius: 8, marginBottom: 24 }}>
              <p style={{ fontSize: 48, fontWeight: 700, color: "#633806" }}>{successId}</p>
            </div>
            <button onClick={() => setSuccessId(null)} style={{ padding: "10px 24px", background: "#D4537E", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "white", borderRadius: 12, padding: "24px", maxWidth: 400, width: "90%" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Tambah Antrian</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Keluhan/Deskripsi</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masukkan keluhan..."
                style={{ width: "100%", padding: "10px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Jam Booking</label>
              <input
                type="datetime-local"
                style={{ width: "100%", padding: "10px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "10px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, background: "white", color: "#333", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
              >
                Batal
              </button>
              <button
                onClick={handleAddAppointment}
                style={{ flex: 1, padding: "10px", background: "#D4537E", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
              >
                Buat Antrian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ dot, label, value, sub }) {
  return (
    <div style={{ background: "white", borderRadius: 10, padding: "14px 18px", border: "0.5px solid rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize: 11, color: "#999", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block" }} />
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 600, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{sub}</p>
    </div>
  );
}

function NavLabel({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.07em", textTransform: "uppercase", padding: "0 8px", margin: "14px 0 4px" }}>{children}</p>;
}

function NavBtn({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", border: "none", borderRadius: 8, background: active ? "#FBEAF0" : "transparent", color: active ? "#993556" : "#777", fontWeight: active ? 600 : 400, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit" }}>
      <span style={{ color: active ? "#D4537E" : "#aaa", display: "flex" }}>{icon}</span>
      {label}
    </button>
  );
}

function IconButton({ children, title }) {
  return (
    <div title={title} style={{ width: 34, height: 34, borderRadius: 8, background: "white", border: "0.5px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#666" }}>
      {children}
    </div>
  );
}

const ic = (d) => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={d} /></svg>;

function HeartbeatIcon() { return <svg width="15" height="15" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>; }
function DashboardIcon() { return ic("M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"); }
function ListIcon() { return ic("M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01"); }
function CalendarIcon() { return ic("M3 4h18v17H3zM16 2v4M8 2v4M3 10h18"); }
function UsersIcon() { return ic("M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"); }
function ChartIcon() { return ic("M3 3v18h18M18 9l-5 5-4-4-4 4"); }
function InfoIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>; }
function SettingsIcon() { return ic("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"); }
function LogoutIcon() { return ic("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"); }
function BellIcon() { return ic("M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"); }
function RefreshIcon() { return ic("M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"); }
function SearchIcon() { return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }