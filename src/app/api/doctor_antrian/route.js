import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API 1: Update status appointment (WAITING -> ONGOING -> DONE)
export async function PUT(req) {
  try {
    const { id } = await req.json();

    // 1. Validasi input
    if (!id) {
      return Response.json(
        { error: "ID appointment wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Cari appointment berdasarkan ID
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return Response.json(
        { error: "Appointment tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Logic update status dan waktu
    let newStatus;
    let updateData = {};

    if (appointment.status === "WAITING") {
      // WAITING -> ONGOING
      newStatus = "ONGOING";
      updateData.startAppointment = new Date(); // Waktu hari ini saat ini
      updateData.status = newStatus;
    } else if (appointment.status === "ONGOING") {
      // ONGOING -> DONE
      newStatus = "DONE";
      updateData.endAppointment = new Date(); // Waktu hari ini saat ini
      updateData.status = newStatus;
    } else {
      return Response.json(
        { error: "Appointment tidak bisa di-update (status: " + appointment.status + ")" },
        { status: 400 }
      );
    }

    // 4. Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        status: true,
        startAppointment: true,
        endAppointment: true,
        description: true,
        booking: true,
        doctorId: true,
        userId: true,
      }
    });

    return Response.json({
      success: true,
      message: `Status berubah dari ${appointment.status} menjadi ${newStatus}`,
      data: updatedAppointment,
    });

  } catch (error) {
    console.error("Update Appointment Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan saat update appointment" },
      { status: 500 }
    );
  }
}

// API 2: Cancel appointment (set status CANCELLED)
export async function POST(req) {
  try {
    const { id } = await req.json();

    // 1. Validasi input
    if (!id) {
      return Response.json(
        { error: "ID appointment wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Cari appointment berdasarkan ID
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return Response.json(
        { error: "Appointment tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Cek apakah appointment sudah DONE atau sudah CANCELLED
    if (appointment.status === "DONE" || appointment.status === "CANCELLED") {
      return Response.json(
        { error: "Tidak bisa membatalkan appointment dengan status " + appointment.status },
        { status: 400 }
      );
    }

    // 4. Update status ke CANCELLED
    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
      select: {
        id: true,
        status: true,
        description: true,
        booking: true,
        doctorId: true,
        userId: true,
      }
    });

    return Response.json({
      success: true,
      message: "Appointment berhasil dibatalkan",
      data: cancelledAppointment,
    });

  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan saat membatalkan appointment" },
      { status: 500 }
    );
  }
}