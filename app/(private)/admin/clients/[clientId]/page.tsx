import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createClientCredential,
  deleteClientCredential,
  getClientCredentials,
  getClientDetails,
  getClientOnboardingSteps,
  toggleClientStatus,
  updateClientGeneralInfo,
  updateOnboardingStep,
} from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type TabId = "overview" | "checklist" | "credentials";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "checklist", label: "Checklist" },
  { id: "credentials", label: "Credenciais" },
];

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluído",
};

export default async function ClientDetailsPage(props: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{
    tab?: string;
    reveal?: string;
    saved?: string;
    deleted?: string;
    statusSaved?: string;
  }>;
}) {
  const { clientId } = await props.params;
  const searchParams = await props.searchParams;
  const tab = tabs.some((item) => item.id === searchParams.tab)
    ? (searchParams.tab as TabId)
    : "overview";

  const [client, steps, credentials] = await Promise.all([
    getClientDetails(clientId),
    getClientOnboardingSteps(clientId),
    getClientCredentials(clientId, searchParams.reveal),
  ]);

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

      {(searchParams.saved === "1" ||
        searchParams.deleted === "1" ||
        searchParams.statusSaved === "1") && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-700">
          Alterações salvas com sucesso.
        </div>
      )}

      <nav className="flex items-center gap-1 border-b">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/admin/clients/${client.id}?tab=${item.id}`}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === item.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
            {tab === item.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {tab === "overview" && (
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
                Status atual:{" "}
                <strong>{client.status === "active" ? "Ativo" : "Inativo"}</strong>
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
      )}

      {tab === "checklist" && (
        <Card>
          <CardHeader>
            <CardTitle>Checklist de onboarding</CardTitle>
            <CardDescription>
              Responsável fixo por passo, com atualização de status e observações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step) => (
              <form
                key={step.id}
                action={updateOnboardingStep}
                className="grid gap-3 rounded-lg border p-4"
              >
                <input type="hidden" name="clientId" value={client.id} />
                <input type="hidden" name="stepId" value={step.id} />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <p className="font-medium">{step.step_order}. {step.step_title}</p>
                  <Badge variant="secondary">{statusLabel[step.status]}</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Status</Label>
                    <select
                      name="status"
                      defaultValue={step.status}
                      className="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="done">Concluído</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label>Responsável (sócio)</Label>
                    <div className="h-9 w-full rounded-md border px-3 text-sm flex items-center bg-muted/30">
                      {step.assigned_partner_name || "Não definido no template"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label>Nota / observação</Label>
                  <textarea
                    name="note"
                    rows={3}
                    defaultValue={step.note || ""}
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    placeholder="Registre detalhes importantes deste passo"
                  />
                </div>

                <div>
                  <SubmitButton textLoading="Salvando..." size="sm">
                    Salvar passo
                  </SubmitButton>
                </div>
              </form>
            ))}

            {steps.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum passo disponível. Verifique se os templates de onboarding foram
                criados no banco.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "credentials" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <Card>
            <CardHeader>
              <CardTitle>Nova credencial</CardTitle>
              <CardDescription>
                Cadastre acessos extras do cliente com senha criptografada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createClientCredential} className="grid gap-3">
                <input type="hidden" name="clientId" value={client.id} />

                <div className="grid gap-1.5">
                  <Label htmlFor="serviceName">Serviço / plataforma</Label>
                  <Input
                    id="serviceName"
                    name="serviceName"
                    placeholder="Meta Ads, RD Station, etc."
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="loginEmail">Email/login</Label>
                  <Input id="loginEmail" name="loginEmail" placeholder="login@cliente.com" />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="loginPassword">Senha</Label>
                  <Input id="loginPassword" name="loginPassword" required />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="url">URL de acesso</Label>
                  <Input id="url" name="url" placeholder="https://..." />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="credentialNotes">Observações</Label>
                  <textarea
                    id="credentialNotes"
                    name="notes"
                    rows={3}
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                </div>

                <SubmitButton textLoading="Salvando...">Adicionar credencial</SubmitButton>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credenciais cadastradas</CardTitle>
              <CardDescription>
                Use revelar senha somente quando necessário.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {credentials.map((credential) => (
                <div key={credential.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{credential.service_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {credential.login_email || "Sem login informado"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/clients/${client.id}?tab=credentials&reveal=${credential.id}`}
                        >
                          Revelar senha
                        </Link>
                      </Button>

                      <form action={deleteClientCredential}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <input
                          type="hidden"
                          name="credentialId"
                          value={credential.id}
                        />
                        <SubmitButton
                          variant="destructive"
                          size="sm"
                          textLoading="Removendo..."
                        >
                          Excluir
                        </SubmitButton>
                      </form>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p>
                      <strong>Senha:</strong>{" "}
                      {credential.revealed_password || credential.masked_password}
                    </p>
                    {credential.url && (
                      <p>
                        <strong>URL:</strong>{" "}
                        <a
                          href={credential.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          {credential.url}
                        </a>
                      </p>
                    )}
                    {credential.notes && (
                      <p>
                        <strong>Obs:</strong> {credential.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {credentials.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma credencial cadastrada para este cliente.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
