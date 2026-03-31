export default function DishCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 animate-pulse bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-24" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded-full w-8" />
      </div>
    </div>
  )
}
