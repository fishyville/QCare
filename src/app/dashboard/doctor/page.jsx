"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── Helpers ─── */
function bookingToSlot(isoString) {
  const d = new Date(isoString);
  return d.toTimeString().slice(0, 5);
}

function getDoctor() {
  try {
    const raw = localStorage.getItem("doctor");
    return raw ? JSON.parse(raw) : { name: "Dokter" };
  } catch { return { name: "Dokter" }; }
}

const STATUS_LABEL = {
  WAITING:    { label: "Menunggu",   color: "#185FA5", bg: "#E6F1FB", border: "#85B7EB" },
  IN_PROGRESS:{ label: "Diperiksa", color: "#993556", bg: "#FBEAF0", border: "#ED93B1" },
  DONE:       { label: "Selesai",   color: "#3B6D11", bg: "#EAF3DE", border: "#B2D98A" },
};

/* ─── Icons ─── */
const IconLogout = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
const IconRefresh = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IconPlay = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconCheck = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconUsers = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
  </svg>
);
const IconClock = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

/* ─── Session Timer ─── */
function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/* ─── Active Session Card ─── */
function ActiveSession({ appointment, onDone, timer }) {
  return (
    <div className="card" style={{ background: "var(--pink-light)", borderColor: "var(--pink-mid)", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Sesi Aktif
        </p>
        <span className="badge pink" style={{ fontVariantNumeric: "tabular-nums", fontSize: 14 }}>
          <IconClock /> {timer}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "var(--pink)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Serif Display',serif", fontSize: 22, flexShrink: 0,
        }}>
          {appointment.id}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{appointment.id}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{bookingToSlot(appointment.booking)}</p>
        </div>
      </div>

      <div className="card" style={{ background: "#fff", marginBottom: 14, padding: "12px 14px" }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Keluhan</p>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{appointment.description}</p>
      </div>

      <button className="btn-pink" onClick={onDone}>
        <IconCheck /> Selesai Periksa
      </button>
    </div>
  );
}

/* ─── Queue Row ─── */
function QueueRow({ appointment, index, onStart, isActive, isDone }) {
  const slot = bookingToSlot(appointment.booking);
  const st   = isDone ? "DONE" : isActive ? "IN_PROGRESS" : "WAITING";
  const s    = STATUS_LABEL[st];

  return (
    <div className="queue-item" style={{
      opacity: isDone ? 0.5 : 1,
      borderColor: isActive ? "var(--pink-mid)" : undefined,
      background: isActive ? "var(--pink-light)" : isDone ? "var(--surface2)" : undefined,
    }}>
      {/* Number */}
      <div className="q-num" style={{
        background: isDone ? "#ddd" : isActive ? "var(--pink)" : "var(--blue-light)",
        color: isDone ? "#999" : isActive ? "#fff" : "#185FA5",
      }}>
        {index + 1}
      </div>

      {/* Info */}
      <div className="q-info">
        <div className="q-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {appointment.id}
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px",
            borderRadius: 99, background: s.bg, color: s.color,
            border: `1px solid ${s.border}`,
          }}>
            {s.label}
          </span>
        </div>
        <div className="q-complaint">{appointment.description}</div>
      </div>

      {/* Time */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span className="q-time">{slot}</span>
        {!isDone && !isActive && (
          <button
            className="btn-pink"
            style={{ padding: "5px 12px", fontSize: 12, width: "auto" }}
            onClick={() => onStart(appointment)}
          >
            <IconPlay /> Mulai
          </button>
        )}
        {isDone && (
          <span style={{ fontSize: 11, color: "#3B6D11", fontWeight: 600 }}>✓ Selesai</span>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function DoctorDashboardPage() {
  const router = useRouter();

  const [doctor, setDoctor]           = useState(null);
  const [queue, setQueue]             = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [apiError, setApiError]       = useState("");

  /* session state */
  const [activeId, setActiveId]       = useState(null); // appointment id being examined
  const [doneIds, setDoneIds]         = useState([]);   // finished appointment ids
  const [timerRunning, setTimerRunning] = useState(false);
  const timer = useTimer(timerRunning);

  /* confirm done modal */
  const [showDoneModal, setShowDoneModal] = useState(false);

  /* dates */
  const [dateStr, setDateStr]         = useState("");

  /* ── Init ── */
  useEffect(() => {
    setDoctor(getDoctor());
    const now = new Date();
    setDateStr(now.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" }));
  }, []);

  /* ── Fetch queue ── */
  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true);
    setApiError("");
    try {
      const res  = await fetch("/api/dashboard");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal memuat antrian");
      const sorted = [...json.data].sort((a, b) => new Date(a.booking) - new Date(b.booking));
      setQueue(sorted);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  /* ── Derived ── */
  const activeAppointment = queue.find(q => q.id === activeId) ?? null;
  const waiting  = queue.filter(q => !doneIds.includes(q.id) && q.id !== activeId);
  const done     = queue.filter(q => doneIds.includes(q.id));
  const total    = queue.length;
  const doneCount = doneIds.length;

  /* ── Start session ── */
  function handleStart(appointment) {
    if (activeId) return; // already examining someone
    setActiveId(appointment.id);
    setTimerRunning(true);
  }

  /* ── Finish session ── */
  function handleDone() {
    setShowDoneModal(true);
  }

  function confirmDone() {
    if (activeId) {
      setDoneIds(prev => [...prev, activeId]);
      setActiveId(null);
      setTimerRunning(false);
      setShowDoneModal(false);
      // TODO: call PATCH /api/dashboard?id=activeId { status: "DONE" } when backend ready
    }
  }

  function handleLogout() {
    localStorage.removeItem("doctor");
    router.push("/");
  }

  if (!doctor) return null;

  return (
    <div className="app">

      {/* Done confirm modal */}
      {showDoneModal && (
        <div className="modal-overlay show" onClick={() => setShowDoneModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 28, textAlign: "center", marginBottom: 10 }}>✅</p>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 8, textAlign: "center" }}>
              Selesai Periksa?
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>
              Konfirmasi bahwa sesi pemeriksaan untuk <strong>{activeId}</strong> telah selesai.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-outline" onClick={() => setShowDoneModal(false)} style={{ flex: 1 }}>
                Kembali
              </button>
              <button className="btn-pink" onClick={confirmDone} style={{ flex: 1 }}>
                <IconCheck /> Ya, Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page">

        {/* Top bar */}
        <div className="top-bar">
          <div>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{dateStr}</p>
            <h2>Halo, {doctor.name} 👨‍⚕️</h2>
          </div>
          <button className="back-btn" onClick={handleLogout}>
            <IconLogout /> Keluar
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { num: total,                      label: "Total Antrian", color: "var(--blue)"  },
            { num: doneCount,                  label: "Selesai",       color: "#3B6D11"      },
            { num: total - doneCount - (activeId ? 1 : 0), label: "Menunggu", color: "var(--pink)" },
          ].map(({ num, label, color }) => (
            <div key={label} className="card" style={{ textAlign: "center", padding: "14px 8px", marginBottom: 0 }}>
              <p style={{ fontSize: 26, fontWeight: 700, color }}>{num}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
              <span>Progress hari ini</span>
              <span>{doneCount}/{total} pasien</span>
            </div>
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {apiError && (
          <div className="info-box pink" style={{ marginBottom: 14 }}>{apiError}</div>
        )}

        {/* Active session */}
        {activeAppointment && (
          <ActiveSession
            appointment={activeAppointment}
            onDone={handleDone}
            timer={timer}
          />
        )}

        {/* No active + no queue */}
        {!activeAppointment && queue.length === 0 && !loadingQueue && (
          <div className="info-box blue" style={{ marginBottom: 20 }}>
            <IconUsers /> Belum ada antrian hari ini.
          </div>
        )}

        {/* All done */}
        {!activeAppointment && queue.length > 0 && waiting.length === 0 && doneCount === total && (
          <div className="info-box" style={{ background: "#EAF3DE", color: "#3B6D11", border: "1.5px solid #B2D98A", marginBottom: 20 }}>
            <IconCheck /> <strong>Semua pasien hari ini sudah diperiksa! 🎉</strong>
          </div>
        )}

        {/* Queue list */}
        <div className="section-head">
          <div className="section-icon" style={{ background: "var(--blue-light)" }}>
            <IconUsers />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>Antrian Hari Ini ({total})</p>
          </div>
          <button className="back-btn" onClick={fetchQueue} disabled={loadingQueue}>
            <IconRefresh /> Refresh
          </button>
        </div>

        {loadingQueue ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Memuat antrian…</p>
        ) : (
          <>
            {queue.map((appt, i) => (
              <QueueRow
                key={appt.id}
                appointment={appt}
                index={i}
                onStart={handleStart}
                isActive={appt.id === activeId}
                isDone={doneIds.includes(appt.id)}
              />
            ))}
          </>
        )}

        {/* Hint when someone is being examined */}
        {activeId && waiting.length > 0 && (
          <div className="info-box blue" style={{ marginTop: 14 }}>
            <IconClock /> Selesaikan sesi aktif dulu sebelum mulai pasien berikutnya.
          </div>
        )}
      </div>
    </div>
  );
}