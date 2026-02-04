"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarGroup,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { logout } from "@/app/(public)/actions";
import { Calendar, Home, LogOut } from "lucide-react";

const items = [
  { title: "Início", url: "/admin/dashboard", icon: Home },
  { title: "Calendários", url: "/admin/calendar", icon: Calendar },
];

export default function AdminSidebarUsage() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* HEADER / LOGO */}
      <SidebarHeader className="bg-primary font-secondary rounded-t-lg text-neutral">
        <SidebarMenu className="px-2 pt-4">
          <SidebarMenuItem className="flex items-center justify-center">
            <Image
              src={"/symbol-conecta-wtbg-white.webp"}
              alt="Logo Conecta"
              width={20}
              height={10}
              unoptimized
              priority
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTEÚDO / LINKS */}
      <SidebarContent className="bg-primary">
        <SidebarGroup>
          <SidebarMenu className="text-neutral font-secondary">
            {items.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(`${item.url}/`);

              return (
                <SidebarMenuItem
                  className="transition-all rounded-sm hover:text-neutral"
                  key={item.title}
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={`
                        hover:bg-neutral/10 
                        ${isActive ? "bg-neutral/10! font-bold! text-white! transition-all!" : ""}
                      `}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER / LOGOUT */}
      <SidebarFooter className="bg-primary rounded-b-lg">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="hover:bg-neutral/10 flex justify-center cursor-pointer text-neutral hover:text-red-200 transition-colors"
              tooltip="Sair"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
