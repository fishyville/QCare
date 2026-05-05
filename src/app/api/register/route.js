import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();

    const { name, email, phone, password } = body;

    // VALIDASI SEDERHANA
    if (!name || !email || !phone || !password) {
      return Response.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // CEK EMAIL SUDAH ADA
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // SIMPAN KE DATABASE
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return Response.json({
      message: "Register berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}