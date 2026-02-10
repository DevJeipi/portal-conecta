"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { createMeeting, deleteMeeting } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export default function CalendarView({
  clients,
  meetings,
  initialClientId,
  profiles,
}: any) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const adminOptions =
    profiles?.map((p: any) => ({
      value: p.id,
      label: p.email, // ou p.full_name se tiver
    })) || [];

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );

  // Modais
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  // Geração do Calendário
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Ações
  const handleClientChange = (value: string) => {
    router.push(`/admin/calendar/meetings?clientId=${value}`);
  };

  async function handleCreate(formData: FormData) {
    await createMeeting(formData);
    setIsNewMeetingOpen(false);
  }

  async function handleDelete() {
    if (!selectedMeeting) return;

    const isConfirmed = confirm(
      "Tem certeza que deseja cancelar esta reunião?",
    );

    if (isConfirmed) {
      await deleteMeeting(selectedMeeting.id);
      setSelectedMeeting(null);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 space-y-4">
      {/* --- HEADER --- */}
      <div className="flex flex-col w-full sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold capitalize text-neutral-800">
            Reuniões: {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h1>
          <div className="flex items-center border rounded-md bg-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <Select
            defaultValue={initialClientId}
            onValueChange={handleClientChange}
          >
            <SelectTrigger className="w-full md:w-50 bg-white">
              <SelectValue placeholder="Filtrar Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              {clients.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.company_name || c.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão Nova Reunião */}
          <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-purple-600 hover:bg-purple-700">
                <Plus size={16} className="mr-2" /> Agendar Reunião
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Nova Reunião</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4 mt-4">
                <div>
                  <Label>Assunto</Label>
                  <Input
                    name="title"
                    placeholder="Ex: Alinhamento Mensal"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Data */}
                  <div>
                    <Label>Data</Label>
                    <Input type="date" name="date" required />
                  </div>
                  {/* Hora (Novo) */}
                  <div>
                    <Label>Horário</Label>
                    <Input type="time" name="time" required />
                  </div>
                </div>

                {/* Link (Novo) */}
                <div>
                  <Label>Link da Sala (Meet/Zoom)</Label>
                  <Input
                    name="link"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div>
                  <Label>Participantes (Admins)</Label>

                  {/* Componente Visual */}
                  <MultiSelect
                    options={adminOptions}
                    selected={selectedParticipants}
                    onChange={setSelectedParticipants}
                    placeholder="Selecione os participantes..."
                  />

                  {/* Input Escondido para enviar os dados para o Server Action */}
                  <input
                    type="hidden"
                    name="participantsJson"
                    value={JSON.stringify(selectedParticipants)}
                  />
                </div>

                <SubmitButton textLoading="Agendando...">
                  Agendar Reunião
                </SubmitButton>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- GRID DO CALENDÁRIO --- */}
      <div className="flex-1 border rounded-lg shadow-sm bg-white flex flex-col overflow-hidden relative">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <div className="min-w-[800px] flex-1 flex flex-col">
            <div className="grid grid-cols-7 border-b bg-neutral-50 shrink-0">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-neutral-500 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Células dos dias */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
              {calendarDays.map((day) => {
                // Filtra as reuniões do dia (usando start_time)
                const dayMeetings = meetings.filter((meeting: any) =>
                  isSameDay(parseISO(meeting.start_time), day),
                );

                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={day.toString()}
                    className={`
                    min-h-[100px]
                    border-b border-r p-2 transition-colors
                    ${!isCurrentMonth ? "bg-neutral-50/50" : "bg-white"}
                    hover:bg-neutral-50
                `}
                  >
                    <div
                      className={`text-right text-sm mb-2 ${!isCurrentMonth ? "text-neutral-300" : "text-neutral-600 font-medium"}`}
                    >
                      {format(day, "d")}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {dayMeetings.map((meeting: any) => {
                        // Formata a hora (ex: 14:30)
                        const timeString = format(
                          parseISO(meeting.start_time),
                          "HH:mm",
                        );

                        return (
                          <button
                            key={meeting.id}
                            onClick={() => setSelectedMeeting(meeting)}
                            className="
                                    text-xs text-left border rounded px-2 py-1.5 truncate shadow-sm transition-all
                                    flex items-center gap-1.5
                                    bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100
                                "
                          >
                            <Video size={12} />
                            <span className="font-bold">{timeString}</span>
                            <span className="truncate">{meeting.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE DETALHES DA REUNIÃO --- */}
      <Dialog
        open={!!selectedMeeting}
        onOpenChange={(open) => !open && setSelectedMeeting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Reunião</DialogTitle>
          </DialogHeader>

          {selectedMeeting && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">
                  Assunto
                </Label>
                <div className="col-span-3 font-medium">
                  {selectedMeeting.title}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left text-muted-foreground">
                  Data e Hora
                </Label>
                <div className="col-span-3">
                  {format(
                    parseISO(selectedMeeting.start_time),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR },
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">
                  Cliente
                </Label>
                <div className="col-span-3">
                  <Badge variant="outline">
                    {selectedMeeting.profiles?.company_name || "Cliente"}
                  </Badge>
                </div>
              </div>

              {/* Exibir Link se existir */}
              {selectedMeeting.meeting_link && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-muted-foreground">
                    Link
                  </Label>
                  <div className="col-span-3">
                    <a
                      href={selectedMeeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      Entrar na sala <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="w-full flex flex-row sm:justify-between gap-2">
            <div className="flex-1 flex justify-start">
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                title="Cancelar Reunião"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            <SubmitButton textLoading="Agendando...">
              Agendar Reunião
            </SubmitButton>

            <div className="flex w-full md:w-auto gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedMeeting(null)}
              >
                Fechar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
