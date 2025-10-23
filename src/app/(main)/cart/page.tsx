"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCart, removeFromCart, clearCart, addToCart } from "@/lib/cart";
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

  const handleIncrease = (product: any) => {
    addToCart(product);
    setCart(getCart());
  };

  const handleDecrease = (product: any) => {
    const updated = cart.map((item) => {
      if (item._id === product._id) {
        return { ...item, qty: item.qty - 1 };
      }
      return item;
    }).filter((item) => item.qty > 0); // hapus item qty=0

    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  const handleCheckout = async () => {
    const external_id = `order-${Date.now()}`;

    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="));

    let email = "guest@edushop.com";
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        email = userData.email || "guest@edushop.com";
      } catch (e) {
        console.error("Error parsing user cookie:", e);
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
                    <div className="flex items-center justify-between mb-2">
                      <span>Harga: Rp {item.price.toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8"
                          onClick={() => handleDecrease(item)}
                        >
                          –
                        </Button>
                        <span className="w-6 text-center">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8"
                          onClick={() => handleIncrease(item)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Subtotal: Rp {(item.price * item.qty).toLocaleString()}
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

          <div className="font-bold mb-4 text-right">
            Total: Rp {total.toLocaleString()}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClear}>
              Kosongkan
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
