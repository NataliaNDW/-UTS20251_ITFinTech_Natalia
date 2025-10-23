import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
// import { sendVerificationCode, verifyCode } from '@/lib/twilio';
import { sendWhatsAppOTP } from "@/lib/fonnte";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    await connectDB();
    const user = await User.findOne({ email });
    console.log("User found:", user);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }
    //send to mfa
    console.log("Sending verification code to:", user.whatsappNumber);
    // await sendVerificationCode(user.whatsappNumber);
    await sendWhatsAppOTP(user.whatsappNumber);
    return NextResponse.json({ message: "Password benar, lanjut MFA", email });
  } catch (err) {
    return NextResponse.json({ error: "Login gagal" }, { status: 500 });
  }
}
