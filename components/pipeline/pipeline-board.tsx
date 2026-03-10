"use client";

import { useId, useRef, useState } from "react";
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
import { deleteDeal, updateDealStage } from "@/app/(private)/admin/pipeline/actions";
import { DealCard } from "./deal-card";
import { DealCardPreview } from "./deal-card-preview";
import { DealDetailsDialog } from "./deal-details-dialog";
import { WonDialog } from "./won-dialog";
import { LostDealDialog } from "./lost-deal-dialog";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
};

export function PipelineBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const dndId = useId();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [wonDeal, setWonDeal] = useState<Deal | null>(null);
  const [wonOpen, setWonOpen] = useState(false);
  const [isConfirmingWonDeal, setIsConfirmingWonDeal] = useState(false);
  const [lostDeal, setLostDeal] = useState<Deal | null>(null);
  const [lostOpen, setLostOpen] = useState(false);
  const [isDeletingLostDeal, setIsDeletingLostDeal] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const didDragRef = useRef(false);

  function pushToast({
    title,
    description,
    type,
  }: Omit<ToastItem, "id">) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }

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

    if (newStage === "lost") {
      setLostDeal(currentDeal);
      setLostOpen(true);
      return;
    }

    if (newStage === "won") {
      setWonDeal(currentDeal);
      setWonOpen(true);
      return;
    }

    // Atualização otimista para os demais estágios
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId ? { ...deal, stage: newStage } : deal,
      ),
    );

    const result = await updateDealStage(dealId, newStage);
    if (!result?.success) {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === dealId ? { ...deal, stage: currentDeal.stage } : deal,
        ),
      );
      pushToast({
        type: "error",
        title: "Nao foi possivel mover a negociacao",
        description: "Tente novamente em instantes.",
      });
      return;
    }
  }

  async function handleConfirmWonDeal() {
    if (!wonDeal || isConfirmingWonDeal) return;

    const confirmedDeal = wonDeal;
    setIsConfirmingWonDeal(true);

    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === confirmedDeal.id ? { ...deal, stage: "won" } : deal,
      ),
    );

    const result = await updateDealStage(confirmedDeal.id, "won");

    if (!result?.success) {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === confirmedDeal.id
            ? { ...deal, stage: confirmedDeal.stage }
            : deal,
        ),
      );
      pushToast({
        type: "error",
        title: "Nao foi possivel confirmar ganho",
        description: "A negociacao voltou para a etapa anterior.",
      });
    } else {
      if (result.companyStatus === "created") {
        pushToast({
          type: "success",
          title: "Empresa criada com sucesso",
          description: "A company foi criada automaticamente para este cliente.",
        });
      } else if (result.companyStatus === "linked_existing") {
        pushToast({
          type: "info",
          title: "Empresa vinculada",
          description: "Uma company existente foi associada ao deal ganho.",
        });
      } else if (result.companyStatus === "failed") {
        const failedDescription =
          result.companyErrorCode === "missing_company_name"
            ? "Preencha o nome da empresa na deal para criar ou vincular a company."
            : result.companyErrorCode === "constraint_violation"
              ? "Nao foi possivel criar a company por restricao de dados no banco (status)."
              : result.companyErrorCode === "permission_denied"
                ? "Verifique as permissoes da tabela companies (RLS/policies)."
                : "Nao foi possivel criar ou vincular company. Verifique os dados da deal e o banco.";
        pushToast({
          type: "error",
          title: "Nao foi possivel criar/vincular company",
          description: failedDescription,
        });
      }

      if (result.onboardingQueueStatus === "queued") {
        pushToast({
          type: "success",
          title: "Cliente preparado para acesso",
          description:
            "O onboarding foi registrado para criar o perfil no primeiro login.",
        });
      } else if (result.onboardingQueueStatus === "skipped_no_email") {
        pushToast({
          type: "info",
          title: "Negociacao ganha sem email",
          description: "Nao foi possivel preparar o acesso automatico do cliente.",
        });
      } else if (result.onboardingQueueStatus === "failed") {
        pushToast({
          type: "error",
          title: "Negociacao ganha, mas onboarding falhou",
          description: "Verifique a fila de onboarding no banco.",
        });
      }
    }

    setIsConfirmingWonDeal(false);
    setWonOpen(false);
    setWonDeal(null);
  }

  async function handleConfirmLostDeal() {
    if (!lostDeal || isDeletingLostDeal) return;

    const deletedDeal = lostDeal;
    setIsDeletingLostDeal(true);

    setDeals((prev) => prev.filter((deal) => deal.id !== deletedDeal.id));

    const result = await deleteDeal(deletedDeal.id);

    if (!result.success) {
      setDeals((prev) => {
        const alreadyExists = prev.some((deal) => deal.id === deletedDeal.id);
        if (alreadyExists) return prev;
        return [deletedDeal, ...prev];
      });
      pushToast({
        type: "error",
        title: "Erro ao remover negociacao perdida",
        description: "A negociacao foi restaurada no board.",
      });
    } else {
      pushToast({
        type: "success",
        title: "Negociacao removida",
        description: "A deal perdida foi deletada do banco de dados.",
      });
    }

    setIsDeletingLostDeal(false);
    setLostOpen(false);
    setLostDeal(null);
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
        id={dndId}
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
        isLoading={isConfirmingWonDeal}
        onConfirm={handleConfirmWonDeal}
        onOpenChange={(open) => {
          if (!isConfirmingWonDeal) {
            setWonOpen(open);
            if (!open) setWonDeal(null);
          }
        }}
      />

      <LostDealDialog
        deal={lostDeal}
        open={lostOpen}
        isLoading={isDeletingLostDeal}
        onConfirm={handleConfirmLostDeal}
        onOpenChange={(open) => {
          if (!isDeletingLostDeal) {
            setLostOpen(open);
            if (!open) setLostDeal(null);
          }
        }}
      />

      <div className="fixed right-4 bottom-4 z-60 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border p-3 shadow-md backdrop-blur-sm ${
              toast.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : toast.type === "error"
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-sky-300 bg-sky-50 text-sky-900"
            }`}
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description ? (
              <p className="mt-1 text-xs opacity-90">{toast.description}</p>
            ) : null}
          </div>
        ))}
      </div>
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
