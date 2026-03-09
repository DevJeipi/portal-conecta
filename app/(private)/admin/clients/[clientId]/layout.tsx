import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientDetails } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientTabsNav } from "./tabs-nav";

export default async function ClientDetailsLayout(props: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await props.params;
  const client = await getClientDetails(clientId);

  if (!client) notFound();

  return (
    <div className="w-full min-h-screen p-6 pb-20 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/clients">Voltar</Link>
          </Button>
          <Badge
            variant="secondary"
            className={
              client.status === "active"
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-red-500/10 text-red-700"
            }
          >
            {client.status === "active" ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
        <p className="text-sm text-muted-foreground">
          {client.primary_email || "Sem email principal"}
        </p>
      </div>

      <ClientTabsNav clientId={clientId} />

      {props.children}
    </div>
  );
}
