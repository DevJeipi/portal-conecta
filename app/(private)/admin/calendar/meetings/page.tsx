import { getClients } from "@/app/(private)/admin/calendar/posts/actions";
import { getMeetings } from "./actions";
import CalendarView from "./calendar-view";

export const dynamic = "force-dynamic";

export default async function MeetingsPage(props: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedClientId = searchParams.clientId || "all";

  // Busca Clientes e Reuniões em paralelo
  const [clients, meetings] = await Promise.all([
    getClients(),
    getMeetings(selectedClientId),
  ]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <CalendarView
        clients={clients}
        meetings={meetings}
        initialClientId={selectedClientId}
      />
    </div>
  );
}
