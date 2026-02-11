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
  isToday,
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
  Pencil,
  Share2,
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
import { createPost, confirmPost, deletePost, updatePost } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export default function CalendarView({ clients, posts, initialClientId }: any) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modais
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Geração do Calendário
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Posts de Hoje (para sidebar)
  const today = new Date();
  const todayPosts = posts.filter((post: any) =>
    isSameDay(new Date(post.post_date), today),
  );

  // Ações
  const handleClientChange = (value: string) => {
    router.push(`/admin/calendar/posts?clientId=${value}`);
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

    const isConfirmed = confirm(
      "Tem certeza que deseja excluir este agendamento? Essa ação não pode ser desfeita.",
    );

    if (isConfirmed) {
      await deletePost(selectedPost.id);
      setSelectedPost(null);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!selectedPost) return;
    await updatePost(selectedPost.id, formData);
    setIsEditing(false);
    setSelectedPost(null);
    router.refresh();
  }

  function handleCloseDetails(open: boolean) {
    if (!open) {
      setSelectedPost(null);
      setIsEditing(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 space-y-4">
      {/* --- HEADER --- */}
      <div className="flex flex-col w-full sm:flex-row items-center justify-between gap-4">
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
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão Novo Post */}
          <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
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
                <div>
                  <Label>Descrição</Label>
                  <textarea
                    name="description"
                    placeholder="Detalhes sobre a publicação..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" name="date" required />
                  </div>
                  <div>
                    <Label>Horário</Label>
                    <Input type="time" name="time" defaultValue="12:00" />
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
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <SubmitButton textLoading="Salvando..." className="w-full">
                  Salvar Agendamento
                </SubmitButton>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- LAYOUT: CALENDÁRIO + SIDEBAR --- */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* --- CONTAINER DO GRID --- */}
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
                  const dayPosts = posts.filter((post: any) =>
                    isSameDay(new Date(post.post_date), day),
                  );

                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);

                  return (
                    <div
                      key={day.toString()}
                      className={`
                        min-h-20 md:min-h-30
                        border-b border-r p-2 transition-colors
                        ${!isCurrentMonth ? "bg-neutral-50/50" : "bg-white"}
                        ${isDayToday ? "bg-blue-50/40" : ""}
                        hover:bg-neutral-50
                      `}
                    >
                      <div className="flex items-center justify-end mb-2">
                        <span
                          className={`text-sm inline-flex items-center justify-center ${
                            isDayToday
                              ? "bg-blue-600 text-white rounded-full w-7 h-7 font-bold"
                              : !isCurrentMonth
                                ? "text-neutral-300"
                                : "text-neutral-600 font-medium"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {dayPosts.map((post: any) => {
                          const isPublished = post.status === "posted";
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
          </div>
        </div>

        {/* --- SIDEBAR: AGENDA DE HOJE --- */}
        <div className="hidden lg:flex flex-col w-80 shrink-0">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">
            Agenda de Hoje
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3">
            {todayPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma publicação agendada para hoje.
              </p>
            ) : (
              todayPosts.map((post: any) => {
                const isPublished = post.status === "posted";
                const postTime = format(new Date(post.post_date), "HH:mm");
                return (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-md ${
                      isPublished
                        ? "border-l-4 border-l-green-500 border-green-200 bg-white"
                        : "border-l-4 border-l-blue-500 border-blue-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Share2
                        size={14}
                        className={
                          isPublished ? "text-green-600" : "text-blue-600"
                        }
                      />
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${
                          isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isPublished ? "publicado" : "agendado"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm text-neutral-800 truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {postTime} · {post.companies?.company_name || "Cliente"}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Legenda */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-neutral-600 mb-2">Legenda</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-neutral-600">Agendado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-neutral-600">Publicado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE DETALHES / EDIÇÃO DO POST --- */}
      <Dialog open={!!selectedPost} onOpenChange={handleCloseDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Publicação" : "Detalhes da Publicação"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Altere os dados da publicação e salve."
                : "Gerencie o status desta entrega."}
            </DialogDescription>
          </DialogHeader>

          {selectedPost && !isEditing && (
            <>
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
                      {selectedPost.companies?.name || "Cliente sem nome"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-muted-foreground">
                    Data
                  </Label>
                  <div className="col-span-3">
                    {format(
                      new Date(selectedPost.post_date),
                      "dd 'de' MMMM, yyyy 'às' HH:mm",
                      { locale: ptBR },
                    )}
                  </div>
                </div>
                {selectedPost.description && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right text-muted-foreground">
                      Descrição
                    </Label>
                    <div className="col-span-3 text-sm text-neutral-600 whitespace-pre-wrap">
                      {selectedPost.description}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-muted-foreground">
                    Status
                  </Label>
                  <div className="col-span-3">
                    {selectedPost.status === "posted" ? (
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

              <DialogFooter className="sm:justify-between gap-2">
                {/* Lado Esquerdo: Excluir e Editar */}
                <div className="flex-1 flex justify-start gap-2">
                  <Button
                    className="w-full md:w-10"
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                    title="Excluir Post"
                  >
                    <Trash2 size={16} />
                  </Button>
                  <Button
                    className="w-full md:w-10"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    title="Editar Post"
                  >
                    <Pencil size={16} />
                  </Button>
                </div>

                {/* Lado Direito: Fechar e Confirmar */}
                <div className="flex w-full md:w-auto gap-2">
                  <Button
                    className="hidden md:block"
                    variant="outline"
                    onClick={() => setSelectedPost(null)}
                  >
                    Fechar
                  </Button>

                  {selectedPost?.status !== "posted" && (
                    <Button
                      onClick={handleConfirm}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmar Postagem
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}

          {selectedPost && isEditing && (
            <form action={handleUpdate} className="space-y-4 mt-4">
              <div>
                <Label>Título do Post</Label>
                <Input
                  name="title"
                  defaultValue={selectedPost.title}
                  placeholder="Ex: Reels Dia das Mães"
                  required
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <textarea
                  name="description"
                  defaultValue={selectedPost.description || ""}
                  placeholder="Detalhes sobre a publicação..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    name="date"
                    defaultValue={format(
                      new Date(selectedPost.post_date),
                      "yyyy-MM-dd",
                    )}
                    required
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    name="time"
                    defaultValue={format(
                      new Date(selectedPost.post_date),
                      "HH:mm",
                    )}
                  />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <select
                    name="clientId"
                    defaultValue={selectedPost.company_id}
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                    required
                  >
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <SubmitButton textLoading="Salvando...">
                  Salvar Alterações
                </SubmitButton>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
