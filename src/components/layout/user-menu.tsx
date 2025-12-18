"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CreditCard, LogOut, Paintbrush, Settings, UserRound } from "lucide-react";
import { usePalette, type PaletteId } from "@/hooks/use-palette";
import { cn } from "@/lib/utils";

import type { Session } from "next-auth";

type DashboardUserMenuProps = {
  locale: string;
  user?: Session["user"];
};

export function DashboardUserMenu({ locale, user }: DashboardUserMenuProps) {
  const intlLocale = useLocale();
  const t = useTranslations("header");
  const { palette, setPalette, palettes, mounted: paletteMounted } = usePalette();
  const isRTL = /^ar/.test(locale);

  const displayName = user?.name || t("userMenu.unknownUser");
  const email = user?.email || "admin@example.com";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const paletteOptions = palettes.map((option) => ({
    id: option.id,
    swatch: option.swatch,
    label: t(`userMenu.palettes.${option.id}` as const),
  }));

  const handlePaletteChange = (value: string) => {
    setPalette(value as PaletteId);
  };

  return (
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
  <Button 
    variant="ghost" 
    className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
  >
    <Avatar className="h-8 w-8 ring-2 ring-primary ring-offset-2 ring-offset-background cursor-pointer">
      <AvatarImage src={user?.image || ""} alt={displayName} />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {initials || "U"}
      </AvatarFallback>
    </Avatar>
  </Button>
</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur"
      >
        <div className="bg-linear-to-br from-primary via-primary/90 to-primary/80 px-4 py-5 text-primary-foreground">
          <div className="flex items-center gap-3" style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
            <Avatar className="h-12 w-12 border-2 border-white/30">
              <AvatarImage src={user?.image || ""} alt={displayName} />
              <AvatarFallback className="bg-muted text-lg font-semibold text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold leading-tight">{displayName}</p>
              <p className="text-xs text-primary-foreground/80">{email}</p>
            </div>
          </div>
        
        </div>

        <div className="p-2">
          <DropdownMenuLabel className="px-2 text-xs uppercase text-muted-foreground" style={isRTL ? { textAlign: "right" } : undefined}>
            {t("overview")}
          </DropdownMenuLabel>
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5" style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
            <Link href={`/${locale}/dashboard/profile`}>
              <UserRound className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t("userMenu.profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5" style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
            <Link href={`/${locale}/dashboard/settings`}>
              <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t("userMenu.settings")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5" style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
            <Link href={`/${locale}/dashboard/cashier`}> 
              <CreditCard className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t("userMenu.billing")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <div className="space-y-3 rounded-2xl border border-dashed border-border/60 p-3">
            {/* Show Theme & Language only on Mobile/Tablet */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground" style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
                <span>{t("userMenu.theme")}</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground" style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
                <span>{t("userMenu.language")}</span>
                <LocaleSwitcher variant="compact" />
              </div>
               <DropdownMenuSeparator className="my-2" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground" style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
                <Paintbrush className="h-3.5 w-3.5 text-primary" />
                <span>{t("userMenu.palette")}</span>
              </div>
              <Select
                value={palette}
                onValueChange={handlePaletteChange}
                disabled={!paletteMounted}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full justify-between rounded-xl border border-border/70 bg-background/60 text-xs font-medium"
                >
                  <SelectValue placeholder={t("userMenu.palette") as string} />
                </SelectTrigger>
                <SelectContent align="end" className="w-60 rounded-2xl">
                  {paletteOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id} style={isRTL ? { flexDirection: "row-reverse" } : undefined}>
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          {option.swatch.map((color) => (
                            <span
                              key={`${option.id}-${color}`}
                              className="h-3 w-3 rounded-full border border-border/60"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            className="rounded-xl px-3 py-2.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center"
            onSelect={() => signOut({ callbackUrl: `/${intlLocale}/login` })}
            style={isRTL ? { flexDirection: "row-reverse" } : undefined}
          >
            <LogOut className="h-4 w-4  text-red-500" />
            {t("userMenu.signOut")}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}