"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  Deal,
  updateDealStatus,
} from "@/app/(private)/admin/pipeline/actions";
import { DealCard } from "./deal-card";
import { DealCardPreview } from "./deal-card-preview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Configuração das Colunas
const COLUMNS = [
  { id: "new", title: "Novos Leads", color: "bg-gray-100" },
  { id: "contacted", title: "Em Contato", color: "bg-blue-50" },
  { id: "proposal", title: "Proposta", color: "bg-yellow-50" },
  { id: "negotiation", title: "Negociação", color: "bg-orange-50" },
  { id: "won", title: "Ganho 🎉", color: "bg-green-100" },
  { id: "lost", title: "Perdido", color: "bg-red-50" },
];

export function PipelineBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const deal = event.active.data.current as Deal;
    setActiveDeal(deal ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStatus = over.id as Deal["status"];
    const currentDeal = active.data.current as Deal;

    if (currentDeal.status === newStatus) return;

    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId
          ? { ...deal, status: newStatus, updated_at: new Date().toISOString() }
          : deal,
      ),
    );

    await updateDealStatus(dealId, newStatus);

    if (newStatus === "won") {
      setSelectedDeal({ ...currentDeal, status: "won" });
      setIsConvertModalOpen(true);
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 w-full min-w-0">
        {COLUMNS.map((col) => (
          <PipelineColumn
            key={col.id}
            column={col}
            deals={deals.filter((d) => d.status === col.id)}
          />
        ))}
      </div>

      {/* Card arrastado renderizado por cima de tudo (evita sumir atrás das colunas) */}
      <DragOverlay dropAnimation={null} className="z-100">
        {activeDeal ? <DealCardPreview deal={activeDeal} /> : null}
      </DragOverlay>

      <ConvertClientDialog
        open={isConvertModalOpen}
        onOpenChange={setIsConvertModalOpen}
        deal={selectedDeal}
      />
    </DndContext>
  );
}

// Sub-componente da Coluna (Droppable)
function PipelineColumn({ column, deals }: { column: any; deals: Deal[] }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  const totalValue = deals.reduce((acc, deal) => acc + Number(deal.value), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[160px] max-w-[220px] h-full rounded-xl flex flex-col border bg-opacity-50 ${column.color}`}
    >
      {/* Cabeçalho Fixo */}
      <div className="p-3 border-b border-gray-200/50 bg-white/50 rounded-t-xl backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-gray-800">
            {column.title}
          </h3>
          <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 border shadow-sm">
            {deals.length}
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Total:{" "}
          <span className="text-gray-900">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalValue)}
          </span>
        </div>
      </div>

      {/* Uma única área de cards com scroll para evitar scroll duplo */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-3 min-h-0">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <div className="h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-xs text-gray-400">
            Arraste aqui
          </div>
        )}
        {/* Área vazia para facilitar o drop */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// Sub-componente Modal de Conversão
function ConvertClientDialog({
  open,
  onOpenChange,
  deal,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  deal: Deal | null;
}) {
  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Parabéns pela Venda! 🚀</DialogTitle>
          <DialogDescription>
            O lead <b>{deal.company_name}</b> foi ganho. Deseja criar um acesso
            ao portal para ele agora?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Email do Cliente</Label>
            <Input
              defaultValue={deal.email || ""}
              placeholder="cliente@empresa.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>Senha Provisória</Label>
            <Input defaultValue="Mudar@123" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Só Marcar como Ganho
          </Button>
          <Button
            onClick={() => {
              // Aqui você chamaria a action convertDealToClient
              onOpenChange(false);
              alert("Cliente criado com sucesso! (Simulação)");
            }}
          >
            Criar Acesso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
