import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. VALIDASI INPUT
    if (!email || !password) {
      return Response.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 2. CARI DOCTOR BERDASARKAN EMAIL
    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    // Jika doctor tidak ditemukan
    if (!doctor) {
      return Response.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 3. VERIFIKASI PASSWORD
    const isPasswordValid = await bcrypt.compare(password, doctor.password);

    if (!isPasswordValid) {
      return Response.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 4. BERHASIL LOGIN
    // Jangan kirim password kembali ke client
    return Response.json({
      message: "Login berhasil",
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
      },
    });

  } catch (error) {
    console.error("Doctor Login Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}