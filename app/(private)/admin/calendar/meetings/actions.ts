"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { google } from "googleapis";

// --- BUSCAR REUNIÕES ---
export async function getMeetings(clientId?: string) {
  const supabase = await createClient();

  let query = supabase.from("meetings").select(`
      *,
      profiles (company_name, email)
    `);

  if (clientId && clientId !== "all") {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar reuniões:", error);
    return [];
  }

  return data || [];
}

// --- CRIAR REUNIÃO (Com Integração Google Service Account) ---
// --- CRIAR REUNIÃO (Versão Produção - Custo Zero) ---
export async function createMeeting(formData: FormData) {
  const supabase = await createClient();

  // 1. Coleta dados
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const link = formData.get("link") as string;
  const participantsJson = formData.get("participantsJson") as string;
  const participantIds = JSON.parse(participantsJson || "[]");

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

  const formatForGoogle = (dateObj: Date) => {
    return dateObj.toISOString().split(".")[0];
  };

  // 2. Prepara emails
  const attendeesEmails: string[] = [];

  if (participantIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email")
      .in("id", participantIds);
    if (profiles) profiles.forEach((p) => attendeesEmails.push(p.email));
  }

  // Tenta pegar o email do usuário logado para adicionar na lista
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (user?.email && !attendeesEmails.includes(user.email)) {
    attendeesEmails.push(user.email);
  }

  // Formato Google
  const googleAttendees = attendeesEmails.map((email) => ({ email }));

  let googleEventLink = link;
  const providerToken = session?.provider_token; // O Token do seu Login

  // 3. INTEGRAÇÃO GOOGLE CALENDAR
  try {
    let calendar;
    let calendarIdToUse = "primary";
    let canInvite = false; // Flag para saber se podemos mandar convite

    // CENÁRIO A: Você está logado (Admin) -> Usa SEU poder (Pode convidar!)
    if (providerToken) {
      console.log("Usando Token do Usuário (Permite Convites!)");
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: providerToken });
      calendar = google.calendar({ version: "v3", auth });
      canInvite = true;
    }
    // CENÁRIO B: Cliente ou sem token -> Usa Robô (NÃO pode convidar no Gmail Grátis)
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.log("Usando Service Account (Modo Silencioso - Sem convites)");
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/calendar"],
      });
      calendar = google.calendar({ version: "v3", auth });

      // Coloque o ID da agenda da empresa aqui
      calendarIdToUse = "conectaamarketing@gmail.com";

      canInvite = false; // Robô no Gmail Free trava se tiver convidados
    }

    if (calendar) {
      const event = await calendar.events.insert({
        calendarId: calendarIdToUse,
        // Só manda email se estiver usando o Token de Usuário
        sendUpdates: canInvite ? "all" : "none",
        requestBody: {
          summary: title,
          description: `Agendado via Portal Conecta.`,
          start: {
            dateTime: formatForGoogle(startDateTime),
            timeZone: "America/Sao_Paulo",
          },
          end: {
            dateTime: formatForGoogle(endDateTime),
            timeZone: "America/Sao_Paulo",
          },
          // TRUQUE: Se for Robô, mandamos lista vazia de attendees para não dar erro
          attendees: canInvite ? googleAttendees : [],
          conferenceData: {
            createRequest: {
              requestId: Math.random().toString(36).substring(7),
            },
          },
        },
        conferenceDataVersion: 1,
      });

      if (event.data.hangoutLink) googleEventLink = event.data.hangoutLink;
      console.log("Evento Criado:", event.data.htmlLink);
    }
  } catch (err) {
    console.error("ERRO GOOGLE:", err);
    // Segue para salvar no banco mesmo com erro
  }

  // 4. Salvar no Supabase (Mantenha seu código de insert igual)
  const { data: meetingData, error } = await supabase
    .from("meetings")
    .insert({
      title,
      start_time: startDateTime.toISOString(),
      meeting_link: googleEventLink,
      status: "scheduled",
      client_id: null,
    })
    .select()
    .single();

  if (error) throw new Error("Erro ao salvar reunião no banco");

  // 5. Salvar Participantes
  if (participantIds.length > 0 && meetingData) {
    const participantsToInsert = participantIds.map((pid: string) => ({
      meeting_id: meetingData.id,
      profile_id: pid,
    }));
    await supabase.from("meeting_participants").insert(participantsToInsert);
  }

  revalidatePath("/admin/calendar/meetings");
}

// --- 3. DELETAR REUNIÃO ---
export async function deleteMeeting(meetingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meetingId);

  if (error) {
    throw new Error("Erro ao deletar reunião");
  }

  revalidatePath("/admin/calendar/meetings");
}
