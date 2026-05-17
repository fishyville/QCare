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
        booking: new Date(booking),
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

