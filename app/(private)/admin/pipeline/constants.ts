export type DealType = "recurring" | "one_off";

export type Deal = {
  id: string;
  title: string;
  value: number;
  stage: string;
  created_at: string;
  deal_type?: DealType | null;
  company_id?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
};

export const STAGES = [
  { id: "new", title: "Novos Leads", dotColor: "bg-blue-500" },
  { id: "discovery", title: "Descoberta", dotColor: "bg-purple-500" },
  { id: "proposal", title: "Proposta Enviada", dotColor: "bg-amber-500" },
  { id: "negotiation", title: "Negociação", dotColor: "bg-sky-500" },
  { id: "won", title: "Ganho", dotColor: "bg-emerald-500" },
  { id: "lost", title: "Perdido", dotColor: "bg-red-500" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];
