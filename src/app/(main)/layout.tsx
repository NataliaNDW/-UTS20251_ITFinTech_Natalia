"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/globals.css";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('user='));
      if (cookie) {
        try {
          setUser(JSON.parse(decodeURIComponent(cookie.split('=')[1])));
        } catch {}
      }
    }
  }, []);

  return (
    <nav className="bg-white border-b mb-8">
      <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 items-center">
        <Link href="/" className="font-bold text-blue-600 hover:underline">Home</Link>
        <Link href="/products" className="hover:underline">Produk</Link>
        <Link href="/cart" className="hover:underline">Keranjang</Link>
        
        {!user ? (
          <Link href="/auth/login" className="ml-auto text-blue-600 hover:underline">Login</Link>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar>
                  <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  {user.name}
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem>
                    <Link href="/admin/products" className="text-red-600">
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link href="/auth/logout" className="text-blue-600">
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
