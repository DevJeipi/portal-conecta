"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import AdminSidebarUsage from "@/components/AdminSidebarUsage";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminLayoutClientProps = Readonly<{
  children: React.ReactNode;
  userRole?: string;
}>;

function MobileTriggerByRole({ userRole }: { userRole?: string }) {
  const { toggleSidebar } = useSidebar();
  const title = userRole === "client" ? "Portal do Cliente" : "Equipe Conecta";

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
      <span className="ml-2 font-bold text-md text-neutral">{title}</span>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
  userRole,
}: AdminLayoutClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AdminSidebarUsage userRole={userRole} />
      <main className="flex min-h-svh min-w-0 flex-1 flex-col overflow-hidden">
        <MobileTriggerByRole userRole={userRole} />
        {children}
      </main>
    </SidebarProvider>
  );
}
