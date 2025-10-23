import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { models } from "mongoose";
import Product from "@/models/Product";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    
    // Clear existing mongoose models to ensure fresh schema
    Object.keys(models).forEach(modelName => {
      delete models[modelName];
    });
    
    //delete all products and seed new ones


    const products = [
      {
        name: "Sushi",
        description: "Makanan khas Jepang yang lezat.",
        price: 50000,
        image: "/images/Sushi.jpg",
      },
      {
        name: "Onigiri",
        description: "Nasi kepal khas Jepang yang lezat.",
        price: 75000,
        image: "/images/Onigiri.png",
      },
      {
        name: "Tteokbokki",
        description: "Makanan ringan khas Korea yang pedas.",
        price: 40000,
        image: "/images/Tteokbokki.jpg",
      },
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);

    // Delete existing users
    await User.deleteMany({});

    // Create admin user instance
    const adminUser = new User({
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("adminpassword", 10),
      role: "admin",
      whatsappNumber: "087787140001",
      whatsappVerified: false,
    });

    console.log("Creating admin user with data:", adminUser);
    
    // Save the user
    await adminUser.save();
    
    // Fetch the user from database to verify
    const savedUser = await User.findOne({ email: "admin@example.com" }).lean();
    console.log("Saved admin user in database:", savedUser);

    return NextResponse.json({ message: "Seeding berhasil!", products });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json({ error: "Seeding gagal" }, { status: 500 });
  }
}
