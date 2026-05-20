import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json(
        { success: false, error: "ID Antrian wajib disertakan" },
        { status: 400 }
      );
    }

    // 1. Cek terlebih dahulu apakah antrian tersebut ada di database
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: id },
    });

    if (!existingAppointment) {
      return Response.json(
        { success: false, error: "Antrian tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Jika ada, lakukan proses penghapusan
    const deletedAppointment = await prisma.appointment.delete({
      where: { id: id },
    });

    return Response.json({
      success: true,
      message: `Antrian dengan ID ${id} berhasil dihapus`,
      data: deletedAppointment,
    });

  } catch (error) {
    console.error("DELETE Appointment Error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan saat menghapus antrian" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Ambil data langsung dari request body sesuai permintaanmu
    const body = await req.json();
    const { userId } = body;

    // Validasi apakah userId dikirim di dalam body
    if (!userId) {
      return Response.json(
        { success: false, error: "User ID wajib diisi di dalam body" },
        { status: 400 }
      );
    }

    // Cari semua antrian berdasarkan userId
    const userAppointments = await prisma.appointment.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        booking: "asc", // Urutkan berdasarkan tanggal booking terlama ke terbaru
      },
    });

    return Response.json({
      success: true,
      data: userAppointments,
    });

  } catch (error) {
    console.error("POST Get Appointment By User Error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan saat mengambil data antrian" },
      { status: 500 }
    );
  }
}