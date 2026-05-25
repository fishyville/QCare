"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─── Constants ─── */
const ALL_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00",
];

const Q_COLORS   = ["#B5D4F4","#9FE1CB","#FAC775","#F0997B","#CECBF6"];
const Q_COLORS_T = ["#0C447C","#085041","#633806","#993C1D","#3C3489"];

/* ─── Helpers ─── */
function slotToBookingISO(slot) {
  const today = new Date().toISOString().split("T")[0];
  return `${today}T${slot}:00`;
}

function bookingToSlot(isoString) {
  const d = new Date(isoString);
  return d.toTimeString().slice(0, 5);
}

function getSessionUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearSessionUser() {
  localStorage.removeItem("user");
}

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
const IconClock = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconUsers = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
  </svg>
);
const IconCheck = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─── Bell Icon ─── */
const IconBell = () => (
  <svg className="notif-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

/* ─── NotificationBell ─── */
function NotificationBell({ notifications, unreadCount, open, onToggle, onMarkAllRead }) {
  function formatTime(date) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  return (
    <div className="notif-wrap">
      <button className="notif-btn" onClick={onToggle} title="Notifikasi">
        <IconBell />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-head">
            <span>Notifikasi</span>
            {unreadCount > 0 && (
              <button className="notif-read-all" onClick={onMarkAllRead}>Tandai semua dibaca</button>
            )}
          </div>
          {notifications.length === 0
            ? <p className="notif-empty">Belum ada notifikasi</p>
            : notifications.map(n => (
              <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`}>
                <p className="notif-item-title">{n.title}</p>
                <p className="notif-item-body">{n.body}</p>
                <p className="notif-item-time">{formatTime(n.time)}</p>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

/* ─── QueueList ─── */
function QueueList({ items, myAppointmentId, showMeBadge }) {
  if (items.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Belum ada antrian hari ini.</p>;
  }
  return (
    <>
      {items.map((q, i) => {
        const isMe = q.id === myAppointmentId;
        const ci = i % Q_COLORS.length;
        const slot = bookingToSlot(q.booking);
        const complaint = q.description ?? "";
        return (
          <div key={q.id} className={`queue-item${isMe ? " me" : ""}`}>
            <div className="q-num" style={{ background: Q_COLORS[ci], color: Q_COLORS_T[ci] }}>
              {i + 1}
            </div>
            <div className="q-info">
              <div className="q-name">
                {q.id}
                {isMe && showMeBadge && (
                  <span className="badge pink" style={{ marginLeft: 8 }}>Saya</span>
                )}
              </div>
              <div className="q-complaint">
                {complaint.length > 44 ? complaint.slice(0, 44) + "…" : complaint}
              </div>
            </div>
            <div className="q-time">{slot}</div>
          </div>
        );
      })}
    </>
  );
}

/* ─── Cancel Modal ─── */
function CancelModal({ onConfirm, onClose, cancelling }) {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: 28, textAlign: "center", marginBottom: 10 }}>⏳</p>
        <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 8, textAlign: "center" }}>
          Batalkan Antrian?
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>
          Kamu akan keluar dari antrian hari ini. Kamu bisa daftar ulang jika masih ada slot tersedia.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-outline" onClick={onClose} style={{ flex: 1 }}>Tidak, Tunggu</button>
          <button className="btn-danger" onClick={onConfirm} disabled={cancelling} style={{ flex: 1 }}>
            {cancelling ? "Membatalkan…" : "Ya, Batalkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser]                       = useState(null);
  const [screen, setScreen]                   = useState("booking");

  /* booking wizard */
  const [bookStep, setBookStep]               = useState(1);
  const [complaint, setComplaint]             = useState("");
  const [selectedSlot, setSelectedSlot]       = useState("");
  const [errors, setErrors]                   = useState({});

  /* API state */
  const [queue, setQueue]                     = useState([]);
  const [takenSlots, setTakenSlots]           = useState([]);
  const [loadingQueue, setLoadingQueue]       = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [cancelling, setCancelling]           = useState(false);
  const [apiError, setApiError]               = useState("");

  /* my appointment */
  const [myAppointmentId, setMyAppointmentId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  /* dates */
  const [dateStr, setDateStr]                 = useState("");
  const [dateShort, setDateShort]             = useState("");

  /* notifications */
  const [notifications, setNotifications]     = useState([]);
  const [notifOpen, setNotifOpen]             = useState(false);
  const notifTimersRef                        = useRef([]);
  const unreadCount                           = notifications.filter(n => !n.read).length;

  /* ── Auth guard ── */
  useEffect(() => {
    const u = getSessionUser();
    if (!u) { router.push("/"); return; }
    setUser(u);
    const now = new Date();
    setDateStr(now.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" }));
    setDateShort(now.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long" }));
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
      setTakenSlots(sorted.map(a => bookingToSlot(a.booking)));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  /* ── Notifications ── */
  function addNotification(title, body) {
    setNotifications(prev => [{ id: Date.now(), title, body, time: new Date(), read: false }, ...prev]);
    if (typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }

  function scheduleNotifications(appointmentISO) {
    notifTimersRef.current.forEach(clearTimeout);
    notifTimersRef.current = [];
    const appointmentTime = new Date(appointmentISO).getTime();
    const now = Date.now();
    const thirtyMinMs = appointmentTime - 30 * 60 * 1000 - now;
    const atTimeMs    = appointmentTime - now;
    if (thirtyMinMs > 0) {
      notifTimersRef.current.push(setTimeout(() => {
        addNotification("⏰ 30 Menit Lagi!", "Jadwal konsultasimu 30 menit lagi. Bersiaplah!");
      }, thirtyMinMs));
    }
    if (atTimeMs > 0) {
      notifTimersRef.current.push(setTimeout(() => {
        addNotification("🏥 Waktunya!", "Jadwal konsultasimu sekarang. Segera menuju ruang dokter!");
      }, atTimeMs));
    }
  }

  /* Update browser tab title with unread count */
  useEffect(() => {
    const base = "QCare - Sistem Antrian Digital";
    document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
  }, [unreadCount]);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e) {
      if (!e.target.closest(".notif-wrap")) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  /* Cleanup timers on unmount */
  useEffect(() => {
    return () => notifTimersRef.current.forEach(clearTimeout);
  }, []);

  /* ── Derived ── */
  const myIdx         = queue.findIndex(q => q.id === myAppointmentId);
  const total         = queue.length;
  const estimatedWait = myIdx > 0 ? myIdx * 15 : 0;
  const myAppointment = queue.find(q => q.id === myAppointmentId) ?? null;

  function slotCount(slot) {
    return queue.filter(q => bookingToSlot(q.booking) === slot).length;
  }

  /* ── Step 1 → 2 ── */
  function goToStep2() {
    const e = {};
    if (!complaint.trim()) e.complaint = "Wajib isi keluhan";
    if (!selectedSlot)     e.slot      = "Pilih jam terlebih dahulu";
    setErrors(e);
    if (Object.keys(e).length) return;
    setBookStep(2);
  }

  /* ── POST /api/dashboard ── */
  async function confirmBooking() {
    if (!user) return;
    setSubmitting(true);
    setApiError("");
    try {
      const res  = await fetch("/api/dashboard", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: complaint,
          userId:      user.id,
          booking:     slotToBookingISO(selectedSlot),
        }),
      });
      console.log(user.id)
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal membuat antrian");
      setMyAppointmentId(json.data.id);
      scheduleNotifications(json.data.booking);
      if (typeof window !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission();
      }
      await fetchQueue();
      setScreen("queue");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Cancel ── */
  async function handleCancel() {
    setCancelling(true);
    try {
      notifTimersRef.current.forEach(clearTimeout);
      notifTimersRef.current = [];
      // await fetch(`/api/dashboard?id=${myAppointmentId}`, { method: "DELETE" });
      setMyAppointmentId(null);
      setComplaint("");
      setSelectedSlot("");
      setBookStep(1);
      setErrors({});
      setApiError("");
      setShowCancelModal(false);
      await fetchQueue();
      setScreen("booking");
    } finally {
      setCancelling(false);
    }
  }

  /* ── Logout ── */
  function handleLogout() {
    clearSessionUser();
    router.push("/");
  }

  if (!user) return null;

  /* ── Step dots helper ── */
  function stepDot(n) {
    if (bookStep > n) return "done";
    if (bookStep === n) return "active";
    return "idle";
  }

  return (
    <div className="app">

      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
          cancelling={cancelling}
        />
      )}

      {/* ══════════════ BOOKING SCREEN ══════════════ */}
      {screen === "booking" && (
        <div className="page">

          {/* Top bar */}
          <div className="top-bar">
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{dateStr}</p>
              <h2>Halo, {user.name}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {myAppointmentId && (
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  open={notifOpen}
                  onToggle={() => setNotifOpen(p => !p)}
                  onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                />
              )}
              <button className="back-btn" onClick={handleLogout} title="Keluar">
                <IconLogout /> Keluar
              </button>
            </div>
          </div>

          {/* Queue count badge */}
          <div style={{ marginBottom: 16 }}>
            <span className="badge blue">
              <IconUsers /> {loadingQueue ? "Memuat…" : `${total} orang antri hari ini`}
            </span>
          </div>

          {apiError && (
            <div className="info-box pink" style={{ marginBottom: 14 }}>{apiError}</div>
          )}

          {/* Steps indicator */}
          <div className="steps">
            <div className="step-item">
              <div className={`step-dot ${stepDot(1)}`}>
                {bookStep > 1 ? <IconCheck /> : "1"}
              </div>
              <span className={`step-label ${stepDot(1)}`}>Keluhan</span>
            </div>
            <div className={`step-line ${bookStep > 1 ? "done" : ""}`} />
            <div className="step-item">
              <div className={`step-dot ${stepDot(2)}`}>
                {bookStep > 2 ? <IconCheck /> : "2"}
              </div>
              <span className={`step-label ${stepDot(2)}`}>Review</span>
            </div>
            <div className={`step-line ${bookStep > 2 ? "done" : ""}`} />
            <div className="step-item">
              <div className={`step-dot ${stepDot(3)}`}>3</div>
              <span className={`step-label ${stepDot(3)}`}>Konfirmasi</span>
            </div>
          </div>

          {/* ── STEP 1 ── */}
          {bookStep === 1 && (
            <>
              <div className="field">
                <label>Keluhan / Gejala</label>
                <textarea
                  placeholder="Contoh: Demam sejak 2 hari, sakit kepala, mual…"
                  value={complaint}
                  onChange={e => { setComplaint(e.target.value); setErrors(p => ({...p, complaint: ""})); }}
                  rows={3}
                  style={errors.complaint ? { borderColor: "#c0392b" } : {}}
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{complaint.length} karakter</p>
                {errors.complaint && <p className="err" style={{ display: "block" }}>{errors.complaint}</p>}
              </div>

              <div className="field">
                <label>Pilih Jam</label>
                {errors.slot && <p className="err" style={{ display: "block", marginBottom: 6 }}>{errors.slot}</p>}
                <div className="time-grid">
                  {ALL_SLOTS.map(slot => {
                    const taken    = takenSlots.includes(slot);
                    const selected = selectedSlot === slot;
                    const count    = slotCount(slot);
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() => { setSelectedSlot(slot); setErrors(p => ({...p, slot: ""})); }}
                        className={`slot${taken ? " taken" : ""}${selected ? " sel" : ""}`}
                      >
                        {slot}
                        {!taken && count > 0 && (
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>{count} org</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="legend" style={{ marginTop: 10 }}>
                  <div className="legend-item">
                    <div className="legend-swatch" style={{ background: "var(--surface2)", border: "1.5px solid var(--border)" }} />
                    Penuh
                  </div>
                  <div className="legend-item">
                    <div className="legend-swatch" style={{ background: "var(--blue-light)", border: "1.5px solid var(--blue-mid)" }} />
                    Ada pendaftar — prioritas siapa duluan daftar
                  </div>
                </div>
              </div>

              <button className="btn-pink" onClick={goToStep2}>
                Lanjut →
              </button>
            </>
          )}

          {/* ── STEP 2: Review ── */}
          {bookStep === 2 && (
            <>
              <div className="card">
                <div className="confirm-row">
                  <span className="lbl">Keluhan</span>
                  <span className="val" style={{ maxWidth: "60%", textAlign: "right" }}>{complaint}</span>
                </div>
                <div className="confirm-row">
                  <span className="lbl">Jam</span>
                  <span className="val" style={{ color: "var(--blue)" }}>{selectedSlot}</span>
                </div>
                <div className="confirm-row">
                  <span className="lbl">Tanggal</span>
                  <span className="val">{dateShort}</span>
                </div>
              </div>

              {slotCount(selectedSlot) > 0 && (
                <div className="info-box blue" style={{ marginBottom: 14 }}>
                  ⚠️ Ada {slotCount(selectedSlot)} orang di jam ini — yang daftar lebih dulu dipanggil lebih dulu.
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-outline" onClick={() => setBookStep(1)} style={{ flex: 1 }}>
                  ← Ubah
                </button>
                <button className="btn-pink" onClick={() => setBookStep(3)} style={{ flex: 1 }}>
                  Lanjut →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Konfirmasi ── */}
          {bookStep === 3 && (
            <>
              <div className="card" style={{ textAlign: "center", padding: "24px 20px" }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>🏥</p>
                <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 4 }}>{user.name}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "var(--blue)", marginBottom: 4 }}>{selectedSlot}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{dateShort}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>"{complaint}"</p>
              </div>

              {apiError && <div className="info-box pink" style={{ marginBottom: 14 }}>{apiError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-outline" onClick={() => setBookStep(2)} style={{ flex: 1 }}>
                  ← Kembali
                </button>
                <button className="btn-pink" onClick={confirmBooking} disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? "Mendaftar…" : "✓ Daftar Sekarang"}
                </button>
              </div>
            </>
          )}

          {/* Live queue */}
          <div style={{ marginTop: 28 }}>
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
            {loadingQueue
              ? <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Memuat antrian…</p>
              : <QueueList items={queue} myAppointmentId={null} showMeBadge={false} />
            }
          </div>
        </div>
      )}

      {/* ══════════════ QUEUE SCREEN ══════════════ */}
      {screen === "queue" && myAppointment && (
        <div className="page">

          <div className="top-bar">
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{dateStr}</p>
              <h2>Antrianmu</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                open={notifOpen}
                onToggle={() => setNotifOpen(p => !p)}
                onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              />
              <button className="back-btn" onClick={handleLogout}>
                <IconLogout /> Keluar
              </button>
            </div>
          </div>

          {/* Ticket card */}
          <div className="card" style={{ textAlign: "center", background: "var(--pink-light)", borderColor: "var(--pink-mid)", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Nomor Antrian</p>
            <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 48, color: "var(--pink)", lineHeight: 1 }}>
              {myAppointment.id}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--blue)", margin: "8px 0 4px" }}>
              {bookingToSlot(myAppointment.booking)}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>{dateShort}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
              "{myAppointment.description}"
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { num: myIdx > 0 ? myIdx : "0", label: "Di depanmu" },
              { num: total,                    label: "Total antrian" },
              { num: myIdx >= 0 ? myIdx + 1 : "—", label: "Posisimu" },
            ].map(({ num, label }) => (
              <div key={label} className="card" style={{ textAlign: "center", padding: "14px 8px", marginBottom: 0 }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: "var(--pink)" }}>{num}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Wait banner */}
          {myIdx > 0 && (
            <div className="info-box blue" style={{ marginBottom: 14 }}>
              <IconClock />
              Estimasi tunggu <strong>~{estimatedWait} menit</strong> ({myIdx} orang di depanmu)
            </div>
          )}
          {myIdx === 0 && (
            <div className="info-box" style={{ background: "#EAF3DE", color: "#3B6D11", border: "1.5px solid #B2D98A", marginBottom: 14 }}>
              <IconCheck />
              <strong>Kamu giliran berikutnya!</strong> Siap-siap ya
            </div>
          )}

          {apiError && <div className="info-box pink" style={{ marginBottom: 14 }}>{apiError}</div>}

          {/* Full queue */}
          <div className="section-head">
            <div className="section-icon" style={{ background: "var(--blue-light)" }}>
              <IconUsers />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Semua Antrian ({total})</p>
            </div>
            <button className="back-btn" onClick={fetchQueue} disabled={loadingQueue}>
              <IconRefresh /> Refresh
            </button>
          </div>
          {loadingQueue
            ? <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Memuat antrian…</p>
            : <QueueList items={queue} myAppointmentId={myAppointmentId} showMeBadge={true} />
          }

          {/* Cancel */}
          <div style={{ marginTop: 20 }}>
            <button className="btn-danger" onClick={() => setShowCancelModal(true)} style={{ width: "100%" }}>
              Batalkan Antrian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
