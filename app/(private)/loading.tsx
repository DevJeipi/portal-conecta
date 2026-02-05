import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col space-y-4 p-4 h-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-50" />
          <Skeleton className="h-4 w-75" />
        </div>
        <Skeleton className="h-10 w-30" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <Skeleton className="h-30 rounded-xl" />
        <Skeleton className="h-30 rounded-xl" />
        <Skeleton className="h-30 rounded-xl" />
        <Skeleton className="h-30 rounded-xl" />
      </div>

      <Skeleton className="h-100 w-full rounded-xl mt-4" />
    </div>
  );
}
