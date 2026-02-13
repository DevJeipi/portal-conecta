"use client";

import { useDraggable } from "@dnd-kit/core";
import { Deal } from "@/app/(private)/admin/pipeline/constants";
import { Badge } from "@/components/ui/badge";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function DealCard({
  deal,
  onClick,
}: {
  deal: Deal;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
    data: deal,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`group rounded-lg border bg-card p-4 shadow-sm transition-all
        cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-primary/20
        ${isDragging ? "opacity-40" : ""}`}
    >
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
