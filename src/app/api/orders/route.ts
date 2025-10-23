import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Orders";
import Payment from "@/models/Payment";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const order = new Order({
      userId: body.userId,
      items: body.items,
    });

    // Hitung total
    order.calculateTotals();

    await order.save();

    // Buat payment record
    const payment = new Payment({
      orderId: order._id,
      amount: order.total,
      status: 'PENDING'
    });

    await payment.save();

    // Update order dengan paymentId
    order.paymentId = payment._id;
    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Ambil query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    let query: any = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('payment')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 }
    );
  }
}
