"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import AdminSidebarUsage from "@/components/AdminSidebarUsage";
import { useState } from "react";
import { Menu } from "lucide-react"; // Ícone de menu
import { Button } from "@/components/ui/button";

function MobileTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="md:hidden w-full flex items-center p-4 border-b bg-primary font-primary">
      <Button
        className="text-neutral hover:bg-neutral/10 hover:text-neutral"
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>
      <span className="ml-2 font-bold text-md text-neutral">
        Equipe Conecta
      </span>
    </div>
  );
}

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
        <main className="w-full min-h-screen flex flex-col items-center justify-center">
          <MobileTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
