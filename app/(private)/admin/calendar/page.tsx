import { getClients, getCalendarPosts } from "./actions";
import CalendarView from "./calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage(props: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const searchParams = await props.searchParams;

  const selectedClientId = searchParams.clientId || "all";

  const [clients, posts] = await Promise.all([
    getClients(),
    getCalendarPosts(selectedClientId),
  ]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <CalendarView
        clients={clients}
        posts={posts}
        initialClientId={selectedClientId}
      />
    </div>
  );
}
