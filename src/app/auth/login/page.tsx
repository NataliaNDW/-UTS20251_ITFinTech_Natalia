"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
	const [form, setForm] = useState({ email: "", password: "" });
	const [step, setStep] = useState(1);
	const [notif, setNotif] = useState("");
	const [otp, setOtp] = useState("");

	const handleLogin = async () => {
		const res = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});
		if (res.ok) {
			setStep(2); // lanjut ke MFA
			setNotif("");
		} else {
			setNotif("Login gagal!");
		}
	};

	const handleMfa = async () => {
		const res = await fetch("/api/auth/mfa", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: form.email, otp }),
		});
		if (res.ok) {
			const data = await res.json();
			setNotif("Login berhasil!");
			// Simpan user ke cookie (simple, untuk demo)
			document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/`;
			// Redirect ke halaman admin

			//if admin
			if (data.user.role === "admin") {
				window.location.href = "/admin";
				return;
			}
			window.location.href = "/products";
		} else {
			setNotif("Kode OTP salah!");
		}
	};

	return (
		<div className="max-w-md mx-auto p-8">
			<Card>
				<CardHeader>
					<h1 className="text-2xl font-bold mb-2">Login</h1>
				</CardHeader>
				<CardContent>
					{notif && (
						<div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
							{notif}
						</div>
					)}
					{step === 1 ? (
						<>
							<input
								type="email"
								placeholder="Email"
								value={form.email}
								onChange={(e) =>
									setForm((f) => ({ ...f, email: e.target.value }))
								}
								className="border px-2 py-1 rounded w-full mb-2"
							/>
							<input
								type="password"
								placeholder="Password"
								value={form.password}
								onChange={(e) =>
									setForm((f) => ({ ...f, password: e.target.value }))
								}
								className="border px-2 py-1 rounded w-full mb-4"
							/>
							<Button
								variant="default"
								className="w-full"
								onClick={handleLogin}
							>
								Login
							</Button>
							<div className="mt-4 text-center text-sm text-gray-600">
								Belum punya akun?{" "}
								<a
									href="/auth/register"
									className="text-blue-600 hover:underline"
								>
									Register di sini
								</a>
							</div>
						</>
					) : (
						<>
							<input
								type="text"
								placeholder="Kode OTP"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								className="border px-2 py-1 rounded w-full mb-4"
							/>
							<Button
								variant="default"
								className="w-full"
								onClick={handleMfa}
							>
								Verifikasi OTP
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
