"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebarUsage from "@/components/AdminSidebarUsage";
import { useState } from "react";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <AdminSidebarUsage />
        <main className="w-full flex items-center justify-center">
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
