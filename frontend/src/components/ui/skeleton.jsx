import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#E2E8F0]", className)}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-8 w-3/5" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, columns = 6 }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-[#E2E8F0]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonStat() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

function SkeletonForm() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-24" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonStat, SkeletonForm }
