'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WhatsAppVerification() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/whatsapp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setCodeSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/whatsapp/verify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          phoneNumber,
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      // Redirect after successful verification
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-xs space-y-4">
        <h1 className="text-2xl font-bold text-center mb-8">
          WhatsApp Verification
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="WhatsApp Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading || codeSent}
            className="w-full"
          />
          {!codeSent && (
            <Button 
              onClick={sendVerificationCode}
              disabled={loading || !phoneNumber}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Code"}
            </Button>
          )}
        </div>

        {codeSent && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={loading}
              className="w-full"
            />
            <Button 
              onClick={verifyCode}
              disabled={loading || !verificationCode}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
