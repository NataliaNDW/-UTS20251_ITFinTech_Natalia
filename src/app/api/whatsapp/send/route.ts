import { NextResponse } from "next/server";
import { sendWhatsAppMess } from "@/lib/twilio";

export async function POST(req: Request) {
  try {
    const { phoneNumber, message } = await req.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    const response = await sendWhatsAppMess(phoneNumber, message);

    return NextResponse.json({
      success: true,
      messageSid: response.sid
    });
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}
