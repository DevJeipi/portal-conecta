"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Deal, STAGES } from "@/app/(private)/admin/pipeline/constants";
import { updateDealStage } from "@/app/(private)/admin/pipeline/actions";
import { DealCard } from "./deal-card";
import { DealCardPreview } from "./deal-card-preview";
import { DealDetailsDialog } from "./deal-details-dialog";
import { WonDialog } from "./won-dialog";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function PipelineBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [wonDeal, setWonDeal] = useState<Deal | null>(null);
  const [wonOpen, setWonOpen] = useState(false);
  const didDragRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    didDragRef.current = true;
    const deal = event.active.data.current as Deal;
    setActiveDeal(deal ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);

    setTimeout(() => {
      didDragRef.current = false;
    }, 150);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as string;
    const currentDeal = active.data.current as Deal;

    if (currentDeal.stage === newStage) return;

    // Atualização otimista
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId ? { ...deal, stage: newStage } : deal,
      ),
    );

    await updateDealStage(dealId, newStage);

    // Se moveu para "won", mostra o dialog de confirmação
    if (newStage === "won") {
      setWonDeal({ ...currentDeal, stage: "won" });
      setWonOpen(true);
    }
  }

  function handleDragCancel() {
    setActiveDeal(null);
    setTimeout(() => {
      didDragRef.current = false;
    }, 150);
  }

  function handleCardClick(deal: Deal) {
    if (didDragRef.current) return;
    setSelectedDeal(deal);
    setDetailsOpen(true);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex h-full gap-3 overflow-x-auto">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            return (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                onCardClick={handleCardClick}
              />
            );
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDeal ? <DealCardPreview deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>

      <DealDetailsDialog
        deal={selectedDeal}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <WonDialog
        deal={wonDeal}
        open={wonOpen}
        onOpenChange={setWonOpen}
      />
    </>
  );
}

/* ───────────────────── Coluna do Pipeline (Droppable) ───────────────────── */

function PipelineColumn({
  stage,
  deals,
  onCardClick,
}: {
  stage: (typeof STAGES)[number];
  deals: Deal[];
  onCardClick: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalValue = deals.reduce((acc, d) => acc + Number(d.value), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-1 min-w-[250px] h-full rounded-xl border transition-colors ${
        isOver
          ? "bg-accent/60 border-primary/30"
          : "bg-muted/30 border-transparent"
      }`}
    >
      {/* Cabeçalho fixo */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${stage.dotColor}`}
            />
            <h3 className="font-semibold text-sm text-foreground truncate">
              {stage.title}
            </h3>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 pl-[18px]">
          {formatBRL(totalValue)}
        </p>
      </div>

      {/* Área de cards com scroll interno */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3 space-y-2.5">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onClick={() => onCardClick(deal)}
          />
        ))}

        {deals.length === 0 && (
          <div className="h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
            Arraste aqui
          </div>
        )}

        <div className="h-2 shrink-0" />
      </div>
    </div>
  );
}
