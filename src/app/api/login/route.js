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

    // 2. CARI USER BERDASARKAN EMAIL
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return Response.json(
        { error: "Email atau password salah" },
        { status: 401 } // Unauthorized
      );
    }

    // 3. VERIFIKASI PASSWORD
    // Membandingkan password dari input dengan hashedPassword di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}