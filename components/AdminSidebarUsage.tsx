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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(public)/actions";
import {
  Calendar,
  Home,
  LogOut,
  ChevronRight,
  ImageIcon,
  Video,
} from "lucide-react";

// Itens principais
const mainItems = [
  {
    title: "Início",
    url: "/admin/dashboard",
    icon: Home,
  },
];

export default function AdminSidebarUsage() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  const isActiveLink = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* --- HEADER --- */}
      <SidebarHeader className="bg-primary font-secondary rounded-t-lg text-neutral border-b border-neutral/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent active:bg-transparent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <Image
                  src={"/symbol-conecta-wtbg-white.webp"}
                  alt="Logo Conecta"
                  width={24}
                  height={24}
                  unoptimized
                  priority
                />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-neutral">Conecta</span>
                <span className="truncate text-xs text-neutral/70">
                  Admin Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* --- CONTENT --- */}
      <SidebarContent className="bg-primary text-neutral scrollbar-none">
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActiveLink(item.url)}
                  className="hover:bg-neutral/10 hover:text-neutral data-[active=true]:bg-neutral/20 data-[active=true]:text-neutral transition-all"
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            <Collapsible
              asChild
              defaultOpen={isActiveLink("/admin/calendar")}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Calendários"
                    className="hover:bg-neutral/10! hover:text-neutral! transition-all group-data-[state=open]/collapsible:text-neutral "
                  >
                    <Calendar />
                    <span className="text-neutral group-data-[collapsible=icon]:hidden">
                      Calendários
                    </span>

                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub className="border-l-neutral/20 ml-3.5">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActiveLink("/admin/calendar/posts")}
                        className=" hover:bg-neutral/10 data-[active=true]:text-neutral data-[active=true]:bg-neutral/10! data-[active=true]:font-medium"
                      >
                        <Link href="/admin/calendar/posts">
                          <ImageIcon
                            color="var(--color-neutral)"
                            className="mr-1 h-4 w-4"
                          />
                          <span className="text-neutral">Postagens</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActiveLink("/admin/calendar/meetings")}
                        className=" hover:bg-neutral/10 data-[active=true]:text-neutral data-[active=true]:bg-neutral/10!  data-[active=true]:font-medium"
                      >
                        <Link href="/admin/calendar/meetings">
                          <Video
                            color="var(--color-neutral)"
                            className="mr-1 h-4 w-4"
                          />
                          <span className="text-neutral">Reuniões</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* --- FOOTER --- */}
      <SidebarFooter className="bg-primary rounded-b-lg border-t border-neutral/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              tooltip="Sair"
              className="text-neutral hover:bg-red-500/10 hover:text-red-200 transition-colors"
            >
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
