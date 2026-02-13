"use client";

import { Deal } from "@/app/(private)/admin/pipeline/constants";
import { Badge } from "@/components/ui/badge";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

/** Versão do card para DragOverlay — sem useDraggable, renderizado por cima de tudo ao arrastar */
export function DealCardPreview({ deal }: { deal: Deal }) {
  return (
    <div className="cursor-grabbing rounded-lg border-2 border-primary/30 bg-card p-4 shadow-xl w-[200px]">
      <h4 className="text-sm font-medium text-foreground leading-tight">
        {deal.company_name || deal.title}
      </h4>

      <div className="mt-2">
        <Badge variant="secondary" className="text-[10px]">
          {deal.deal_type === "recurring" ? "Recorrente" : "One-off"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mt-1.5 font-medium">
        {formatBRL(deal.value)}
      </p>
    </div>
  );
}
