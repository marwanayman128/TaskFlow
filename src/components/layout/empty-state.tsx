import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicAnimation } from "./dynamic-animation";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center pb-8 text-center animate-in fade-in-50 duration-500",
        "rounded-3xl border border-dashed border-border/60 bg-card/30",
        className
      )}
    >
            <DynamicAnimation animationUrl="/animations/people-looking-through-binoculars-illustration-2025-10-20-23-53-14-utc.json" />

      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8 text-base">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
