import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Order from "@/models/Orders";

interface XenditWebhookBody {
  external_id: string;
  status: string;
  paid_at?: string;
}

export async function POST(req: Request) {
  try {
    const tokenHeader = req.headers.get("x-callback-token");
    const secretToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (!secretToken) {
      console.error("❌ XENDIT_WEBHOOK_TOKEN belum di-set di env");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (tokenHeader !== secretToken) {
      console.error("❌ Invalid Xendit callback token:", tokenHeader);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: XenditWebhookBody = await req.json();
    console.log("📩 Webhook received:", JSON.stringify(body, null, 2));

    // ✅ Tunggu update DB selesai
    await processPayment(body);

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Webhook error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function processPayment(body: XenditWebhookBody) {
  try {
    await connectDB();
    const { external_id, status, paid_at } = body;

    if (!external_id) {
      console.warn("⚠ Webhook missing external_id");
      return;
    }

    // Update payment status
    const newStatus = status === "PAID" ? "LUNAS" : "GAGAL";
    const payment = await Payment.findOneAndUpdate(
      { external_id },
      { 
        status: newStatus, 
        paid_at: status === "PAID" ? (paid_at ? new Date(paid_at) : new Date()) : undefined 
      },
      { new: true }
    );

    if (!payment) {
      console.log(`⚠ Payment ${external_id} not found in DB`);
      return;
    }

    console.log(`✅ Payment ${external_id} updated to ${newStatus}`);

    // Update order status
    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      { status: newStatus },
      { new: true }
    );

    if (order) {
      console.log(`✅ Order ${order._id} updated to ${newStatus}`);
    } else {
      console.log(`⚠ Order not found for payment ${external_id}`);
    }
  } catch (err) {
    console.error("❌ DB processing error:", err);
  }
}