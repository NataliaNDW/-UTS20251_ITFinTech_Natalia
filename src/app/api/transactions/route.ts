import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";

export async function GET() {
  try {
    await connectDB();
    
    // Ambil semua transaksi dan populate dengan data user (kecuali password)
    const transactions = await Checkout.find({})
      .populate({
        path: "user",
        select: "-password" // Exclude password field
      })
      .populate("products.product") // Populate product details
      .sort({ createdAt: -1 }); // Sort by newest first
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
