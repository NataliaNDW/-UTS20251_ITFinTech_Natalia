import { NextResponse } from "next/server";
import { sendVerificationCode, verifyCode } from "@/lib/twilio";

// Kirim kode verifikasi
export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const verification = await sendVerificationCode(phoneNumber);

    return NextResponse.json({
      success: true,
      status: verification.status
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

// Verifikasi kode
export async function PUT(req: Request) {
  try {
    const { phoneNumber, code } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    const verification = await verifyCode(phoneNumber, code);

    return NextResponse.json({
      success: true,
      status: verification.status
    });
  } catch (error) {
    console.error("Verification Check Error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
