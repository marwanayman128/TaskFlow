"use client";

import * as React from "react";
import { Languages, ChevronDown } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { Button } from "@/components/ui/button";
import { ENABLE_I18N } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LocaleSwitcherVariant = "icon" | "pill" | "compact";

type LocaleKey = "en" | "ar";

interface LocaleSwitcherProps {
  variant?: LocaleSwitcherVariant;
}

const localeMeta: Record<LocaleKey, { label: string; native: string }> = {
  en: { label: "English", native: "English" },
  ar: { label: "Arabic", native: "العربية" },
};

function FlagIcon({ code }: { code: LocaleKey }) {
  if (code === "ar") {
    return (
      <svg viewBox="0 0 20 14" className="h-4 w-6" xmlns="http://www.w3.org/2000/svg">
        <rect width="20" height="14" rx="2" fill="#006C35" />
        <rect x="2" y="6" width="16" height="2" rx="1" fill="#ffffff" opacity="0.8" />
        <circle cx="16" cy="7" r="1.5" fill="#ffffff" opacity="0.9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 14" className="h-4 w-6" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" rx="2" fill="#B22234" />
      <g fill="#ffffff">
        <rect y="2" width="20" height="1" />
        <rect y="4" width="20" height="1" />
        <rect y="6" width="20" height="1" />
        <rect y="8" width="20" height="1" />
        <rect y="10" width="20" height="1" />
        <rect y="12" width="20" height="1" />
      </g>
      <rect width="9" height="7" fill="#3C3B6E" rx="1" />
      <circle cx="2" cy="2" r="0.5" fill="white" />
      <circle cx="4" cy="2" r="0.5" fill="white" />
      <circle cx="6" cy="2" r="0.5" fill="white" />
      <circle cx="8" cy="2" r="0.5" fill="white" />
      <circle cx="3" cy="3.5" r="0.5" fill="white" />
      <circle cx="5" cy="3.5" r="0.5" fill="white" />
      <circle cx="7" cy="3.5" r="0.5" fill="white" />
      <circle cx="2" cy="5" r="0.5" fill="white" />
      <circle cx="4" cy="5" r="0.5" fill="white" />
      <circle cx="6" cy="5" r="0.5" fill="white" />
      <circle cx="8" cy="5" r="0.5" fill="white" />
    </svg>
  );
}

export function LocaleSwitcher({ variant = "icon" }: LocaleSwitcherProps) {
  const { locale, changeLocale, isPending } = useLocale();
  const activeLocale = (localeMeta[locale as LocaleKey] ? locale : "en") as LocaleKey;

  // Hide the language switcher if i18n is disabled
  if (!ENABLE_I18N) {
    return null;
  }


  const triggerClasses = (() => {
    switch (variant) {
      case "pill":
        return "h-11 rounded-full border border-border/60 px-3";
      case "compact":
        return "h-9 rounded-full border border-border/60 px-2";
      default:
        return "h-9 w-9";
    }
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "pill" ? "outline" : "ghost"}
          size={variant === "icon" ? "icon" : variant === "compact" ? "sm" : "default"}
          className={`${triggerClasses} border-accent  `}
          disabled={isPending}
        >
          {variant === "icon" && <Languages className="h-[1.1rem] w-[1.1rem]" />}
          {variant !== "icon" && (
            <div className="flex items-center gap-2">
              <FlagIcon code={activeLocale} />
              <span className="text-sm font-medium">
                {variant === "pill"
                  ? localeMeta[activeLocale].label
                  : activeLocale.toUpperCase()}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          )}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.keys(localeMeta).map((key) => {
          const localeKey = key as LocaleKey;
          return (
            <DropdownMenuItem
              key={localeKey}
              className="flex items-center gap-3"
              disabled={isPending || activeLocale === localeKey}
              onSelect={(event) => {
                event.preventDefault();
                if (localeKey !== activeLocale) {
                  changeLocale(localeKey);
                }
              }}
            >
              <div className="flex h-7 w-10 items-center justify-center rounded-md border border-border/60 bg-background">
                <FlagIcon code={localeKey} />
              </div>
              <div className="flex flex-col text-sm">
                <span className="font-medium">{localeMeta[localeKey].label}</span>
                <span className="text-xs text-muted-foreground">
                  {localeMeta[localeKey].native}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
