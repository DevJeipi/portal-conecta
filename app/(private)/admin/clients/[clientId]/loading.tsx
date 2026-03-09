import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailsLoading() {
  return (
    <div className="w-full min-h-screen p-6 pb-20 flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex items-center gap-1 border-b pb-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}
