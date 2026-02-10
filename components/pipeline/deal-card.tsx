"use client";

import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, GripVertical } from "lucide-react";
import { differenceInDays } from "date-fns";
import { Deal } from "@/app/(private)/admin/pipeline/actions";

export function DealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
    data: deal,
  });

  const daysStagnant = differenceInDays(new Date(), new Date(deal.updated_at));
  const isStagnant =
    daysStagnant > 15 && deal.status !== "won" && deal.status !== "lost";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`mb-3 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}
    >
      <Card
        className={`shadow-sm hover:shadow-md transition-all ${isStagnant ? "border-red-300 bg-red-50" : ""}`}
      >
        <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium leading-none">
              {deal.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{deal.company_name}</p>
          </div>
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-bold text-green-700">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(deal.value)}
            </span>

            {isStagnant && (
              <Badge variant="destructive" className="text-[10px] h-5 px-1">
                <AlertCircle className="w-3 h-3 mr-1" /> {daysStagnant}d parado
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
