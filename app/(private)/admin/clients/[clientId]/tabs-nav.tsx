"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabsNavProps = {
  clientId: string;
};

const tabs = [
  { id: "overview", label: "Visão geral" },
  { id: "checklist", label: "Checklist" },
  { id: "credentials", label: "Credenciais" },
] as const;

export function ClientTabsNav({ clientId }: TabsNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b">
      {tabs.map((item) => {
        const href = `/admin/clients/${clientId}/${item.id}`;
        const isActive = pathname === href;

        return (
          <Link
            key={item.id}
            href={href}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
