"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Order {
  _id: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        console.log("Orders data:", data);
        // Pastikan data adalah array
        const ordersArray = Array.isArray(data) ? data : [];
        setOrders(ordersArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin: Daftar Orders</h1>
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <Card key={order._id} className="flex flex-col">
            <CardHeader>
              <h2 className="font-semibold text-lg">Order #{order._id}</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">User ID:</span> {order.userId}
                </div>
                <div>
                  <span className="font-semibold">Subtotal:</span> Rp {order.subtotal.toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Tax:</span> Rp {order.tax.toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Total:</span> Rp {order.total.toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> 
                  <span className={`ml-1 px-2 py-1 rounded text-sm ${
                    order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                    order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    order.status === "PAID" ? "bg-blue-100 text-blue-800" :
                    order.status === "FAILED" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Tanggal:</span> {new Date(order.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Payment ID:</span> {order.paymentId || "-"}
                </div>
                <div className="mt-4">
                  <span className="font-semibold">Items:</span>
                  <div className="mt-2 space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>{item.name}</span>
                        <span>
                          {item.qty}x @ Rp {item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
