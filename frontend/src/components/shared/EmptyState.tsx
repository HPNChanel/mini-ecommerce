import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action}
    </div>
  );
}
