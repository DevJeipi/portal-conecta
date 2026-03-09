import Link from "next/link";
import { syncClientsFromCompanies, getClients } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ClientsPageSearchParams = {
  status?: string;
  q?: string;
};

export default async function ClientsPage(props: {
  searchParams: Promise<ClientsPageSearchParams>;
}) {
  const searchParams = await props.searchParams;
  const status =
    searchParams.status === "active" || searchParams.status === "inactive"
      ? searchParams.status
      : "all";
  const query = (searchParams.q ?? "").trim();

  const clients = await getClients({
    status: status === "all" ? undefined : status,
    query: query || undefined,
  });

  return (
    <div className="w-full min-h-screen p-6 pb-20 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie onboarding, dados e credenciais dos clientes.
          </p>
        </div>

        <form action={syncClientsFromCompanies}>
          <Button variant="outline" type="submit">
            Sincronizar empresas do pipeline
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col md:flex-row gap-3">
            <Input
              name="q"
              placeholder="Buscar cliente por nome"
              defaultValue={query}
              className="md:max-w-sm"
            />

            <select
              name="status"
              defaultValue={status}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full md:w-[180px] rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <Button type="submit" variant="outline" className="md:w-auto w-full">
              Aplicar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email principal</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{client.primary_email || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/clients/${client.id}/overview`}>Ver detalhes</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {clients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum cliente encontrado. Use a sincronização para importar
                    empresas do pipeline.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
