"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createDeal } from "@/app/(private)/admin/pipeline/actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateDealDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await createDeal(formData);
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar negociação.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nova Negociação
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Negociação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título do Projeto</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: E-commerce de Roupas"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Nome da Empresa / Cliente</Label>
            <Input
              id="company"
              name="company_name"
              placeholder="Ex: Loja Hering Centro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact">Contato (Nome)</Label>
              <Input id="contact" name="contact_name" placeholder="Ex: João" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Valor Estimado (R$)</Label>
              <Input id="value" name="value" placeholder="0,00" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="cliente@email.com"
            />
            <p className="text-[10px] text-muted-foreground">
              Usado para criar acesso futuro.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deal_type">Tipo do Deal</Label>
            <select
              id="deal_type"
              name="deal_type"
              defaultValue="one_off"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <option value="one_off">One-off</option>
              <option value="recurring">Recorrente</option>
            </select>
            <p className="text-[10px] text-muted-foreground">
              Define se a receita sera recorrente ou pontual.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <div className="flex justify-end mt-2">
            <SubmitButton textLoading="Criando...">
              Salvar Negociação
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
