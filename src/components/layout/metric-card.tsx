"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ReactNode, type ComponentType } from "react";
import * as React from "react";
import { type MetricTrend } from "@/lib/types/types";

// Available color variants that match globals.css
export type MetricColorVariant = 
  | "emerald" 
  | "sky" 
  | "lime" 
  | "amber" 
  | "purple" 
  | "rose" 
  | "blue" 
  | "orange" 
  | "indigo" 
  | "red";

interface MetricChartConfig {
  path?: string;
  viewBox?: string;
  colorClassName?: string;
  ariaLabel?: string;
  content?: ReactNode;
}

interface MetricCardProps {
  title: string;
  icon: ComponentType<{ className?: string }> | string;
  /** Color variant - uses CSS classes from globals.css (analytics-icon-*, analytics-gradient-*) */
  colorVariant?: MetricColorVariant;
  /** @deprecated Use colorVariant instead */
  iconClassName?: string;
  /** @deprecated Use colorVariant instead */
  gradientClassName?: string;
  blurClassName?: string;
  className?: string;
  eyebrow?: string;
  value?: ReactNode;
  description?: string;
  trend?: MetricTrend;
  chart?: MetricChartConfig;
  delay?: number;
  children?: ReactNode;
}

export function MetricCard({
  title,
  icon,
  colorVariant = "emerald",
  iconClassName,
  gradientClassName,
  blurClassName,
  className,
  eyebrow,
  value,
  description,
  trend,
  chart,
  delay = 0,
  children,
}: MetricCardProps) {
  const hasStructuredContent = value !== undefined || trend !== undefined || chart !== undefined || description;

  // Use CSS classes from globals.css if colorVariant is provided
  const iconClass = iconClassName || `analytics-icon-${colorVariant}`;
  const gradientClass = gradientClassName || `analytics-gradient-${colorVariant}`;
  const sparklineClass = `analytics-sparkline-${colorVariant}`;

  const chartNode = chart?.content
    ? chart.content
    : chart?.path ? (
        <svg
          viewBox={chart.viewBox ?? "0 0 48 28"}
          className={cn("h-full w-full stroke-2", chart.colorClassName ?? sparklineClass)}
          fill="none"
          role={chart.ariaLabel ? "img" : undefined}
          aria-label={chart.ariaLabel}
        >
          <path
            d={chart.path}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null;

  const content = children ?? (
    hasStructuredContent && (
      <div className="flex items-end justify-between gap-4">
        <div>
          {value !== undefined && (
            <p className="analytics-value">{value}</p>
          )}
          {trend && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              {trend.label}
            </p>
          )}
          {description && (
            <p className={cn("text-xs text-muted-foreground", trend ? "mt-1" : "mt-2")}>{description}</p>
          )}
        </div>
        {chartNode && <div className="flex h-14 w-28 items-center justify-center">{chartNode}</div>}
      </div>
    )
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      whileHover={{ y: -6 }}
    >
      <Card className={cn("analytics-card group p-5 h-full flex flex-col", className)}>
        {/* Gradient background */}
        <div className={cn("pointer-events-none absolute inset-0 transition duration-500", gradientClass)} />
        
        {/* Blur effect */}
        <div
          className={cn(
            "pointer-events-none absolute -right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl",
            blurClassName
          )}
        />
        
        <div className="relative flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {eyebrow && (
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {eyebrow}
                </p>
              )}
              <p className="analytics-title">{title}</p>
            </div>
            <div className={cn("analytics-icon-container", iconClass)}>
              {typeof icon === 'string' ? (
                <span className="h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {icon.charAt(0)}
                </span>
              ) : (
                React.createElement(icon, { className: "h-5 w-5" })
              )}
            </div>
          </div>
          {content}
        </div>
      </Card>
    </motion.div>
  );
}
