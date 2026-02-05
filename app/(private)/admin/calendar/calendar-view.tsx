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
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createPost, confirmPost, deletePost } from "./actions";

export default function CalendarView({ clients, posts, initialClientId }: any) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modais
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Geração do Calendário
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Ações
  const handleClientChange = (value: string) => {
    router.push(`/admin/calendar?clientId=${value}`);
  };

  async function handleCreate(formData: FormData) {
    await createPost(formData);
    setIsNewPostOpen(false);
  }

  async function handleConfirm() {
    if (!selectedPost) return;
    await confirmPost(selectedPost.id);
    setSelectedPost(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!selectedPost) return;

    // Uma confirmação simples do navegador para evitar acidentes
    const isConfirmed = confirm(
      "Tem certeza que deseja excluir este agendamento? Essa ação não pode ser desfeita.",
    );

    if (isConfirmed) {
      await deletePost(selectedPost.id);
      setSelectedPost(null); // Fecha o modal
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 space-y-4">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold capitalize text-neutral-800">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            defaultValue={initialClientId}
            onValueChange={handleClientChange}
          >
            <SelectTrigger className="w-50 bg-white">
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

          {/* Botão Novo Post */}
          <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" /> Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Publicação</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4 mt-4">
                <div>
                  <Label>Título do Post</Label>
                  <Input
                    name="title"
                    placeholder="Ex: Reels Dia das Mães"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" name="date" required />
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <select
                      name="clientId"
                      className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                      required
                    >
                      {clients.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.company_name || c.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Salvar Agendamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- GRID DO CALENDÁRIO --- */}
      <div className="flex-1 border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col">
        {/* Dias da semana */}
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
            const dayPosts = posts.filter((post: any) =>
              isSameDay(new Date(post.scheduled_date), day),
            );

            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toString()}
                className={`
                    min-h-30 border-b border-r p-2 transition-colors
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
                  {dayPosts.map((post: any) => {
                    const isPublished = post.status === "published";
                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className={`
                                    text-xs text-left border rounded px-2 py-1.5 truncate shadow-sm transition-all
                                    flex items-center gap-1.5
                                    ${
                                      isPublished
                                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    }
                                `}
                      >
                        {isPublished ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        <span className="truncate">{post.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL DE DETALHES DO POST --- */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Publicação</DialogTitle>
            <DialogDescription>
              Gerencie o status desta entrega.
            </DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">
                  Título
                </Label>
                <div className="col-span-3 font-medium">
                  {selectedPost.title}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">
                  Cliente
                </Label>
                <div className="col-span-3">
                  <Badge variant="outline">
                    {selectedPost.profiles?.company_name || "Cliente sem nome"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">Data</Label>
                <div className="col-span-3">
                  {format(
                    new Date(selectedPost.scheduled_date),
                    "dd 'de' MMMM, yyyy",
                    { locale: ptBR },
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">
                  Status
                </Label>
                <div className="col-span-3">
                  {selectedPost.status === "published" ? (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Publicado
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-blue-600 bg-blue-50"
                    >
                      Agendado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2">
            {/* Lado Esquerdo: Botão de Excluir */}
            <div className="flex-1 flex justify-start">
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                title="Excluir Post"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            {/* Lado Direito: Fechar e Confirmar */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedPost(null)}>
                Fechar
              </Button>

              {selectedPost?.status !== "published" && (
                <Button
                  onClick={handleConfirm}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmar Postagem
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
