"use client";
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-gray-100 min-h-screen flex" style={{
        width: "-webkit-fill-available",
      }}>
        <AppSidebar />
        <main className="flex-1 min-h-screen">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}