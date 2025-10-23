import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import response from "twilio/lib/http/response";

import {verifyWhatsAppOTP} from "@/lib/fonnte";

export async function POST(req: Request) {
  try {
    //whatsapp twilio verify
    const { otp , email } = await req.json();
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const isVerified = verifyWhatsAppOTP(user.whatsappNumber, otp);
    if (!isVerified) {
      return NextResponse.json({ error: "Kode OTP salah" }, { status: 401 });
    }

    return NextResponse.json({ message: "MFA berhasil, login sukses", user });
  } catch {
    return NextResponse.json({ error: "MFA gagal" }, { status: 500 });
  }
}
