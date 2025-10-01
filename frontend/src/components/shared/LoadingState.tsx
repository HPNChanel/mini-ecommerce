export function LoadingState({ message = "Loading" }: { message?: string }): JSX.Element {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-600">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-ping rounded-full bg-slate-400" />
        <span>{message}…</span>
      </div>
    </div>
  );
}
