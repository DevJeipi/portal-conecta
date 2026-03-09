import Link from "next/link";
import {
  createClientCredential,
  deleteClientCredential,
  getClientCredentials,
} from "../../actions";
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

export default async function ClientCredentialsPage(props: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ reveal?: string; saved?: string; deleted?: string }>;
}) {
  const { clientId } = await props.params;
  const searchParams = await props.searchParams;
  const credentials = await getClientCredentials(clientId, searchParams.reveal);

  return (
    <div className="grid gap-6">
      {(searchParams.saved === "1" || searchParams.deleted === "1") && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-700">
          Alterações salvas com sucesso.
        </div>
      )}

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
              <input type="hidden" name="clientId" value={clientId} />

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
                        href={`/admin/clients/${clientId}/credentials?reveal=${credential.id}`}
                      >
                        Revelar senha
                      </Link>
                    </Button>

                    <form action={deleteClientCredential}>
                      <input type="hidden" name="clientId" value={clientId} />
                      <input type="hidden" name="credentialId" value={credential.id} />
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
    </div>
  );
}
