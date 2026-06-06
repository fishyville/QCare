import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        booking: {
          gte: new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z'),
          lte: new Date(new Date().toISOString().split('T')[0] + 'T23:59:59Z'),
        },
      },
      select: {
        id: true,
        description: true,
        status: true,
        booking: true, 
      },
      orderBy: {
        booking: "desc",
      },
    });

    return Response.json({
      success: true,
      data: appointments,
    });
    
  } catch (error) {
    console.error("GET Appointment Today Error:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil data antrian hari ini" }, 
      { status: 500 }
    );
  }
}

// Fungsi untuk MENAMBAH antrian (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    const { description, userId, booking } = body;

    if (!description || !userId || !booking) {
      return Response.json(
        { success: false, error: "Deskripsi, User ID, dan Booking wajib diisi" },
        { status: 400 }
      );
    }

    const bookingDate = new Date(booking);
    if (isNaN(bookingDate.getTime())) {
      return Response.json(
        { success: false, error: "Format booking time tidak valid" },
        { status: 400 }
      );
    }

    // Find the last appointment to get the highest number
    const lastAppointment = await prisma.appointment.findFirst({
      orderBy: {
        id: "desc", // Get the last ID alphabetically (A999 > A001)
      },
      select: {
        id: true,
      },
    });

    let nextNumber = 1;
    if (lastAppointment && lastAppointment.id.startsWith('A')) {
      const lastNumber = parseInt(lastAppointment.id.substring(1), 10);
      nextNumber = lastNumber + 1;
    }

    const customId = `A${String(nextNumber).padStart(3, '0')}`;

    const newAppointment = await prisma.appointment.create({
      data: {
        id: customId,
        description: description,
        userId: userId,
        doctorId: "D01",
        status: "WAITING",
        booking: bookingDate,
        startAppointment: null,
        endAppointment: null
      },
    });

    return Response.json({
      success: true,
      data: newAppointment,
    });

  } catch (error) {
    console.error("POST Appointment Error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan saat membuat antrian" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // Mengambil ID antrian dari dynamic URL parameter (misal: /api/appointment/A001)
    const { id } = params;

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
