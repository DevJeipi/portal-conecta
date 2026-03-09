import {
  getClientDetails,
  toggleClientStatus,
  updateClientGeneralInfo,
} from "../../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { notFound } from "next/navigation";

export default async function ClientOverviewPage(props: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ saved?: string; statusSaved?: string }>;
}) {
  const { clientId } = await props.params;
  const searchParams = await props.searchParams;
  const client = await getClientDetails(clientId);

  if (!client) notFound();

  return (
    <div className="grid gap-6">
      {(searchParams.saved === "1" || searchParams.statusSaved === "1") && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-700">
          Alterações salvas com sucesso.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Informações do cliente</CardTitle>
          <CardDescription>
            Atualize dados principais usados no relacionamento com o cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateClientGeneralInfo} className="grid gap-4">
            <input type="hidden" name="clientId" value={client.id} />

            <div className="grid gap-2">
              <Label htmlFor="name">Nome do cliente</Label>
              <Input id="name" name="name" defaultValue={client.name} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="primaryEmail">Email principal</Label>
              <Input
                id="primaryEmail"
                name="primaryEmail"
                type="email"
                defaultValue={client.primary_email || ""}
                placeholder="contato@cliente.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações gerais</Label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={client.notes || ""}
                rows={5}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                placeholder="Pontos importantes sobre o cliente"
              />
            </div>

            <SubmitButton textLoading="Salvando...">Salvar informações</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status de acesso</CardTitle>
          <CardDescription>
            Clientes inativos não conseguem entrar no portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Status atual: <strong>{client.status === "active" ? "Ativo" : "Inativo"}</strong>
          </p>
          <form action={toggleClientStatus}>
            <input type="hidden" name="clientId" value={client.id} />
            <input
              type="hidden"
              name="status"
              value={client.status === "active" ? "inactive" : "active"}
            />
            <SubmitButton
              variant={client.status === "active" ? "destructive" : "default"}
              textLoading="Atualizando..."
            >
              {client.status === "active" ? "Desativar cliente" : "Ativar cliente"}
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
