"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  }, []);
  return <div className="p-8 text-center">Logout...</div>;
}
