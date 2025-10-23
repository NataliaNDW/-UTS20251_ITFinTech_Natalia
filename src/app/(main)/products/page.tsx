"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState("");

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
    setNotif(`Produk '${product.name}' ditambahkan ke keranjang!`);
    setTimeout(() => setNotif(""), 1500);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Daftar Produk</h1>
      {notif && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{notif}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product: any) => (
          <Card key={product._id} className="flex flex-col">
            <CardHeader>
              <h2 className="font-semibold text-lg">{product.name}</h2>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{product.description}</p>
              <div className="font-bold mb-4">Rp {product.price.toLocaleString()}</div>
              <Button variant="default" className="w-full" onClick={() => handleAdd(product)}>
                Tambah ke Keranjang
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
