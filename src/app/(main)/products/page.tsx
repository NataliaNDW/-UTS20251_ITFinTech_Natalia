"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<{ show: boolean; name: string }>({
    show: false,
    name: "",
  });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  const handleAdd = (product: any) => {
    addToCart(product);
    setNotif({ show: true, name: product.name });
    setTimeout(() => setNotif({ show: false, name: "" }), 3500);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 relative">
      <h1 className="text-2xl font-bold mb-6">Daftar Produk</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product: any) => (
          <Card key={product._id} className="flex flex-col">
            <CardHeader>
              <h2 className="font-semibold text-lg">{product.name}</h2>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{product.description}</p>
              <div className="font-bold mb-4">
                Rp {product.price.toLocaleString()}
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleAdd(product)}
              >
                Tambah ke Keranjang
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom modal kecil di pojok kanan bawah */}
      {notif.show && (
        <div
          className="fixed bottom-5 left-220 z-50 w-fit max-w-xs
          bg-white border border-gray-200 rounded-lg shadow-lg 
          px-4 py-3 text-sm text-gray-700
          animate-in slide-in-from-bottom-3 fade-in duration-200"
        >
          <div className="flex flex-col gap-1">
            <div className="text-green-700 font-semibold text-sm flex items-center gap-1">
              ✅ Ditambahkan ke keranjang
            </div>
            <div className="text-xs text-gray-600">
              {notif.name} berhasil ditambahkan.
            </div>
            <div className="flex justify-end mt-2">
              <Link href="/cart">
                <Button
                  size="sm"
                  className="text-xs px-2 h-6"
                  variant="default"
                >
                  Lihat Keranjang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
