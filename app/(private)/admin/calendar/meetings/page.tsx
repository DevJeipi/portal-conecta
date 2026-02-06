import { createClient } from "@/utils/supabase/server";
import { getClients } from "@/app/(private)/admin/calendar/posts/actions";
import { getMeetings } from "./actions";
import CalendarView from "./calendar-view";

export const dynamic = "force-dynamic";

export default async function MeetingsPage(props: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedClientId = searchParams.clientId || "all";
  const supabase = await createClient();

  const [clients, meetings, profilesResponse] = await Promise.all([
    getClients(),
    getMeetings(selectedClientId),
    supabase.from("profiles").select("id, email, company_name"),
  ]);

  const profiles = profilesResponse.data || [];

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <CalendarView
        clients={clients}
        meetings={meetings}
        profiles={profiles}
        initialClientId={selectedClientId}
      />
    </div>
  );
}
