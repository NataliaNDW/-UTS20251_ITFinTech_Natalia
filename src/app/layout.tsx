"use client";
import { ReactNode } from "react";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}