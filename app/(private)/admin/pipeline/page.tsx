import { getDeals } from "./actions";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { CreateDealDialog } from "@/components/pipeline/create-deal-dialog"; // Vamos criar esse arquivo já já

export default async function PipelinePage() {
  const deals = await getDeals();

  return (
    // Altura fixa e overflow-hidden para não criar scroll na página
    <div className="flex flex-col h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full overflow-hidden p-6 min-h-0">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pipeline Comercial
          </h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe suas negociações em tempo real.
          </p>
        </div>
        <CreateDealDialog />
      </div>

      {/* Board ocupa o resto sem criar scroll; scroll só dentro das colunas */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PipelineBoard initialDeals={deals} />
      </div>
    </div>
  );
}
