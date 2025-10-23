import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Payment from "@/models/Payment";
import Order from "@/models/Orders";
import { connectDB } from "@/lib/mongodb";

interface PaymentItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface PaymentRequestBody {
  external_id: string;
  email: string;
  amount: number;
  items: PaymentItem[];
}

export async function POST(req: Request) {
  const PAYMENT_SUCCESS_URL = process.env.PAYMENT_SUCCESS_URL || "http://localhost:3000/payment-success";
  try {
    const body: PaymentRequestBody = await req.json();
    const { external_id, email, amount, items } = body;

    // Ambil userId dari cookies
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    let userId = email; // default ke email untuk guest

    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.value));
        userId = userData._id; // mengambil _id dari data user yang tersimpan
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }

    if (!external_id || !email || !amount || !items || !items.length) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // ✅ Ambil API Key dari environment
    const XENDIT_API_KEY = process.env.XENDIT_API_KEY;
    if (!XENDIT_API_KEY) {
      console.error("❌ XENDIT_API_KEY tidak ditemukan di environment");
      return NextResponse.json(
        { error: "Konfigurasi server tidak lengkap (API key tidak ditemukan)" },
        { status: 500 }
      );
    }

    // ✅ Koneksi ke MongoDB
    await connectDB();

    // ✅ Buat order terlebih dahulu
    const orderItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      qty: item.quantity,
      price: item.price
    }));

    // Hitung total sebelum membuat order
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + tax;

    const order = await Order.create({
      userId: userId, // Menggunakan userId dari cookies atau email sebagai fallback
      items: orderItems,
      subtotal,
      tax,
      total,
      status: "PENDING"
    });

    // ✅ Simpan transaksi payment ke database
    const payment = await Payment.create({
      external_id,
      orderId: order._id,
      amount,
      email,
      status: "PENDING",
    });

    // Update order dengan paymentId
    order.paymentId = payment._id;
    await order.save();

    // ✅ Encode Basic Auth (gunakan Buffer, bukan btoa)
    const authHeader =
      "Basic " + Buffer.from(`${XENDIT_API_KEY}:`).toString("base64");

    // ✅ Panggil API Xendit
    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        external_id,
        payer_email: email,
        amount,
        description: "Pembayaran EduShop",
        items,
        success_redirect_url: `${PAYMENT_SUCCESS_URL}?external_id=${external_id}`,
      }),
    });

    const data = await res.json();

    console.log("🧾 Xendit Response:", data);

    //update status payment
    if (data.id) {
      payment.status = "PAID";
      await payment.save();
    }

    //update order status to LUNAS if payment is successful
    if (data.id) {
      order.status = "PAID";
      await order.save();
    }

    if (data.invoice_url) {
      return NextResponse.json({ invoice_url: data.invoice_url, data });
    }

    return NextResponse.json(
      { error: data.message || "Gagal membuat invoice", data },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Error di server:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
