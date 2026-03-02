import { getClientCalendarPosts } from "./actions";
import CalendarViewClient from "./calendar-view-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const posts = await getClientCalendarPosts();

  return (
    <div className="flex flex-col w-full h-full">
      <CalendarViewClient posts={posts} />
    </div>
  );
}
