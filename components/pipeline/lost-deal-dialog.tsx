"use client";

import { Deal } from "@/app/(private)/admin/pipeline/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export function LostDealDialog({
  deal,
  open,
  isLoading,
  onConfirm,
  onOpenChange,
}: {
  deal: Deal | null;
  open: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <DialogTitle>Remover negociação perdida?</DialogTitle>
          </div>
          <DialogDescription>
            Ao confirmar, <strong>{deal.company_name || deal.title}</strong> sera
            removido(a) permanentemente do banco de dados.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Removendo..." : "Confirmar Remoção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
