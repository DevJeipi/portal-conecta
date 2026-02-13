"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Deal, STAGES } from "@/app/(private)/admin/pipeline/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  User,
  Repeat,
} from "lucide-react";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function DealDetailsDialog({
  deal,
  open,
  onOpenChange,
}: {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!deal) return null;

  const stage = STAGES.find((s) => s.id === deal.stage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg leading-tight">
            {deal.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes da negociação
          </DialogDescription>
          {stage && (
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${stage.dotColor}`}
              />
              <span className="text-sm text-muted-foreground">
                {stage.title}
              </span>
            </div>
          )}
        </DialogHeader>

        <Separator />

        <div className="grid gap-4 py-2">
          {/* Valor */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <DollarSign className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-lg font-semibold text-foreground">
                {formatBRL(deal.value)}
              </p>
            </div>
          </div>

          {/* Empresa */}
          {deal.company_name && (
            <DetailRow
              icon={<Building2 className="h-4 w-4" />}
              label="Empresa"
              value={deal.company_name}
            />
          )}

          {/* Título / Projeto */}
          {deal.company_name && deal.title !== deal.company_name && (
            <DetailRow
              icon={<FileText className="h-4 w-4" />}
              label="Projeto"
              value={deal.title}
            />
          )}

          <DetailRow
            icon={<Repeat className="h-4 w-4" />}
            label="Tipo"
            value={deal.deal_type === "recurring" ? "Recorrente" : "One-off"}
          />

          {/* Contato */}
          {deal.contact_name && (
            <DetailRow
              icon={<User className="h-4 w-4" />}
              label="Contato"
              value={deal.contact_name}
            />
          )}

          {/* Email */}
          {deal.email && (
            <DetailRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={deal.email}
            />
          )}

          {/* Data de Criação */}
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Criado em"
            value={format(new Date(deal.created_at), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
