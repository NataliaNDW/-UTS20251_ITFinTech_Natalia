"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCart, removeFromCart, clearCart } from "@/lib/cart";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setCart(getCart());
  };

  const handleClear = () => {
    clearCart();
    setCart([]);
  };

  const handleCheckout = async () => {
    // Kirim data keranjang ke backend untuk membuat invoice Xendit
    // Siapkan payload sesuai endpoint payment
    const external_id = `order-${Date.now()}`;
    
    // Get email from cookie using client-side method
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='));
      console.log("User cookie:", userCookie);
    
    let email = "guest@edushop.com";
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        email = userData.email || "guest@edushop.com";
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
    const amount = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
    const items = cart.map((item) => ({
      productId: item._id,
      name: item.name,
      quantity: item.qty,
      price: item.price,
    }));
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ external_id, email, amount, items }),
    });
    if (res.ok) {
      const data = await res.json();
      // Redirect ke URL pembayaran Xendit
      window.location.href = data.invoice_url;
    }
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-gray-500">Keranjang kosong.</div>
          ) : (
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <Card key={item._id} className="flex flex-col">
                  <CardHeader>
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">Jumlah: {item.qty}</div>
                    <div className="mb-2">
                      Harga: Rp {item.price.toLocaleString()}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleRemove(item._id)}
                      className="mt-2"
                    >
                      Hapus
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="font-bold mb-4">
            Total: Rp {total.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClear}>
              Kosongkan Keranjang
            </Button>
            {cart.length > 0 && (
              <Button variant="default" onClick={handleCheckout}>
                Checkout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
