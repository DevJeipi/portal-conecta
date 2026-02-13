import { getDeals } from "./actions";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { CreateDealDialog } from "@/components/pipeline/create-deal-dialog";

export default async function PipelinePage() {
  const deals = await getDeals();

  return (
    <div className="flex flex-col h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full overflow-hidden p-4 sm:p-6 min-h-0">
      {/* Header fixo */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Pipeline Comercial
          </h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe suas negociações em tempo real.
          </p>
        </div>
        <CreateDealDialog />
      </div>

      {/* Board ocupa o espaço restante */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PipelineBoard initialDeals={deals} />
      </div>
    </div>
  );
}
