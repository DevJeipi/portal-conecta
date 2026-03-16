"use client";

import { useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type CalendarPost = {
  id: string;
  title: string;
  post_date: string;
  description?: string | null;
  caption?: string | null;
  status?: string | null;
  post_link?: string | null;
};

function safeParseDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function CalendarViewClient({ posts }: { posts: CalendarPost[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  const validPosts = posts.filter((post) => !!safeParseDate(post.post_date));

  const todayPosts = validPosts.filter((post) =>
    isSameDay(safeParseDate(post.post_date)!, today),
  );
  const monthPosts = validPosts
    .filter((post) =>
      isWithinInterval(safeParseDate(post.post_date)!, {
        start: monthStart,
        end: monthEnd,
      }),
    )
    .sort(
      (a, b) =>
        safeParseDate(a.post_date)!.getTime() - safeParseDate(b.post_date)!.getTime(),
    );

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

      <div className="border rounded-lg shadow-sm bg-white flex-1 overflow-hidden">
        <div className="flex h-full gap-4 p-0 lg:p-0">
          <div className="overflow-x-auto h-full flex-1">
            <div className="min-w-[800px] h-full flex flex-col">
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

              <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {calendarDays.map((day) => {
                  const dayPosts = validPosts.filter((post) =>
                    isSameDay(safeParseDate(post.post_date)!, day),
                  );
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);

                  return (
                    <div
                      key={day.toString()}
                      className={`
                      min-h-24 border-b border-r p-2 transition-colors
                      ${!isCurrentMonth ? "bg-neutral-50/50" : "bg-white"}
                      ${isDayToday ? "bg-blue-50/40" : ""}
                    `}
                    >
                      <div className="flex items-center justify-end mb-2">
                        <span
                          className={`text-sm inline-flex items-center justify-center ${isDayToday
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
                        {dayPosts.map((post) => {
                          const isPublished = post.status === "posted";
                          return (
                            <button
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              className={`
                              text-xs text-left border rounded px-2 py-1.5 truncate shadow-sm transition-all
                              flex items-center gap-1.5 w-full
                              ${isPublished
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
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

          <div className="hidden lg:flex flex-col w-80 shrink-0 p-4 border-l">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Agenda de Hoje
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3">
              {todayPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma publicação agendada para hoje.
                </p>
              ) : (
                todayPosts.map((post) => {
                  const isPublished = post.status === "posted";
                  const postTime = format(safeParseDate(post.post_date)!, "HH:mm");
                  return (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-md ${isPublished
                        ? "border-l-4 border-l-green-500 border-green-200 bg-white"
                        : "border-l-4 border-l-blue-500 border-blue-200 bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${isPublished
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
                        {postTime}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

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
              <p className="mt-4 text-xs text-muted-foreground">
                {monthPosts.length} publicação(ões) neste mês.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Demanda</DialogTitle>
          </DialogHeader>

          {selectedPost && (
            <div className="grid gap-3 text-sm">
              <p>
                <span className="font-medium">Título:</span> {selectedPost.title}
              </p>
              <p>
                <span className="font-medium">Data:</span>{" "}
                {(() => {
                  const d = safeParseDate(selectedPost.post_date);
                  return d ? format(d, "dd/MM/yyyy HH:mm") : "Data inválida";
                })()}
              </p>
              {selectedPost.description ? (
                <p>
                  <span className="font-medium">Descrição:</span>{" "}
                  {selectedPost.description}
                </p>
              ) : null}
              {selectedPost.caption ? (
                <p>
                  <span className="font-medium">Legenda:</span> {selectedPost.caption}
                </p>
              ) : null}
              {selectedPost.post_link ? (
                <p>
                  <span className="font-medium">Link:</span>{" "}
                  <a
                    href={selectedPost.post_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedPost.post_link}
                  </a>
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {selectedPost.status === "posted" ? (
                  <Badge className="bg-green-600 hover:bg-green-700">Publicado</Badge>
                ) : (
                  <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                    Agendado
                  </Badge>
                )}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
