export function SavedSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border-tn-hair overflow-hidden rounded-[16px] border bg-white animate-pulse"
        >
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="bg-tn-paper h-[72px] w-[60px] shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="bg-tn-paper h-2.5 w-16 rounded" />
              <div className="bg-tn-paper h-4.5 w-48 rounded" />
              <div className="bg-tn-paper h-3 w-32 rounded" />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
              <div className="flex flex-col items-start sm:items-end gap-1.5">
                <div className="bg-tn-paper h-5 w-24 rounded" />
                <div className="bg-tn-paper h-3 w-16 rounded" />
              </div>
              <div className="bg-tn-paper size-[34px] rounded-[10px]" />
            </div>
          </div>
          <div className="bg-tn-paper border-tn-hair2 flex items-center justify-between border-t px-4 py-3 sm:px-5">
            <div className="bg-tn-hair h-4 w-40 rounded" />
            <div className="bg-tn-hair h-7 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
