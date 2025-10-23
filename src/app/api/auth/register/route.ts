import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, whatsappNumber} = await req.json();
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, whatsappNumber });
    return NextResponse.json({ message: "Registrasi berhasil", user });
  } catch (err) {
    return NextResponse.json({ error: "Registrasi gagal" }, { status: 500 });
  }
}
