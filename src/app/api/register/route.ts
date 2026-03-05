import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nim, email, password, phone, role, ktmImageUrl } = body;

    // Validation
    if (!name || !nim || !email || !password) {
      return NextResponse.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 },
      );
    }

    // Check if email already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    // Check if NIM already registered
    const existingNim = await prisma.user.findUnique({
      where: { nim },
    });
    if (existingNim) {
      return NextResponse.json(
        { error: "NIM sudah terdaftar" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        nim,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role || "BUYER",
        ktmImageUrl: ktmImageUrl || null,
        approvalStatus: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil! Menunggu verifikasi admin.",
        userId: user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 },
    );
  }
}
