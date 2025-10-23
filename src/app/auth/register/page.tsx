"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", whatsappNumber: "" });  
  const [notif, setNotif] = useState("");

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setNotif("Registrasi berhasil! Silakan login.");
      setForm({ name: "", email: "", password: "" , whatsappNumber: "" });
    } else {
      setNotif("Registrasi gagal!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold mb-2">Register</h1>
        </CardHeader>
        <CardContent>
          {notif && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{notif}</div>}
          <input
            type="text"
            placeholder="Nama"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="border px-2 py-1 rounded w-full mb-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="border px-2 py-1 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="WhatsApp Number"
            value={form.whatsappNumber}
            onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
            className="border px-2 py-1 rounded w-full mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="border px-2 py-1 rounded w-full mb-4"
          />
          <Button variant="default" className="w-full" onClick={handleRegister}>Register</Button>
          <div className="mt-4 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline">Login di sini</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
