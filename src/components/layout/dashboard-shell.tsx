"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Sparkles
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { DynamicAnimation } from "./dynamic-animation";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4">
      {children}
    </div>
  );
}
