"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Deal } from "@/app/(private)/admin/pipeline/constants";
import { PartyPopper, Mail, Info } from "lucide-react";

export function WonDialog({
  deal,
  open,
  onOpenChange,
}: {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!deal) return null;

  const hasEmail = !!deal.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-emerald-500" />
            <DialogTitle>Negociação Ganha!</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{deal.company_name || deal.title}</strong> foi marcado como
            ganho.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {hasEmail ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <Mail className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Acesso automático configurado
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                  Quando <strong>{deal.email}</strong> entrar pelo Google, o
                  acesso ao portal será criado automaticamente como cliente.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Email não cadastrado
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  Esta negociação não possui email registrado. O acesso
                  automático só funciona se o email do cliente estiver
                  cadastrado no deal.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
