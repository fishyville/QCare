import { PrismaClient } from '@prisma/client' // Sesuaikan dengan path prisma client-mu
import bcrypt from "bcrypt";

const prisma = new PrismaClient()  
// Fungsi untuk generate ID dokter
async function generateDoctorId(prismaClient) {
  // Cari dokter terakhir yang dibuat
  const lastDoctor = await prismaClient.doctor.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    select: { id: true }
  });

  if (lastDoctor.length === 0) {
    // Jika tidak ada dokter, mulai dari D01
    return 'D01';
  }

  // Extract nomor dari ID terakhir (misal: dari 'D05' ambil '5')
  const lastId = lastDoctor[0].id;
  const lastNumber = parseInt(lastId.substring(1)); // Hapus 'D0', ambil angkanya
  const newNumber = lastNumber + 1;

  // Format ID baru: D0 + nomor (contoh: D06)
  return `D0${newNumber}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, specialty } = body;

    // 1. Validasi Input Input Wajib
    if (!name || !email || !password) {
      return Response.json(
        { success: false, error: "Nama, Email, dan Password wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Cek apakah email dokter sudah terdaftar di database
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email: email },
    });

    if (existingDoctor) {
      return Response.json(
        { success: false, error: "Email sudah terdaftar sebagai dokter" },
        { status: 400 }
      );
    }

    // Optional: Jika kamu ingin mencegah dokter mendaftar menggunakan email yang sama dengan User biasa
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return Response.json(
        { success: false, error: "Email ini sudah terdaftar sebagai akun pasien/user biasa" },
        { status: 400 }
      );
    }

    // 3. Hash password agar aman di database
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan data dokter baru ke database Supabase melalui Prisma
    // ID otomatis menggunakan UUID sesuai dengan settingan di schema.prisma kamu (@default(uuid()))
    const newDoctor = await prisma.doctor.create({
      data: {
        id: await generateDoctorId(prisma), // ← Tambah line ini
        name: name,
        email: email,
        password: hashedPassword,
        specialty: specialty || null, // Jika specialty tidak diisi, set jadi null
      },
      // Ambil data yang aman saja untuk dikembalikan ke frontend (tanpa password)
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        createdAt: true,
      }
    });

    return Response.json({
      success: true,
      message: "Registrasi akun dokter berhasil",
      data: newDoctor,
    }, { status: 201 });

  } catch (error) {
    console.error("POST Register Doctor Error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan saat meregistrasi dokter" },
      { status: 500 }
    );
  }
}