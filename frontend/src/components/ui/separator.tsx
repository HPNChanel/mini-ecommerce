import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn("h-px w-full bg-slate-200", className)} {...props} />;
}
