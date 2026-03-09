import { getClientOnboardingSteps, updateOnboardingStep } from "../../actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluído",
};

export default async function ClientChecklistPage(props: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { clientId } = await props.params;
  const searchParams = await props.searchParams;
  const steps = await getClientOnboardingSteps(clientId);

  return (
    <div className="grid gap-6">
      {searchParams.saved === "1" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-700">
          Alterações salvas com sucesso.
        </div>
      )}

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
              <input type="hidden" name="clientId" value={clientId} />
              <input type="hidden" name="stepId" value={step.id} />

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p className="font-medium">
                  {step.step_order}. {step.step_title}
                </p>
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
    </div>
  );
}
