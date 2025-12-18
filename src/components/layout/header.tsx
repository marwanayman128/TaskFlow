"use client";

import { useTranslations } from "next-intl";
import { Session } from "next-auth";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { CustomThemeToggle } from "@/components/layout/custom-theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { DashboardUserMenu } from "@/components/layout/user-menu";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { SearchWidget } from "@/components/layout/search-widget";
import { MobileMenuToggle, SideBarToggle } from "@/components/layout/sidebar";

interface DashboardHeaderProps {
  locale: string;
  session?: Session | null;
}

export function Header({ locale, session }: DashboardHeaderProps) {
  const tDashboard = useTranslations("dashboard");
  const tHeader = useTranslations("header");

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="relative flex flex-wrap items-center justify-between gap-2 md:gap-2 rounded-xl md:rounded-2xl border border-border/60 bg-background/90 px-3 md:px-4 py-2 md:py-3 shadow-sm backdrop-blur supports-backdrop-filter:backdrop-blur-lg">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-2 md:gap-2 min-w-0">
          <MobileMenuToggle />
          <SideBarToggle />
          <Separator orientation="vertical" className="h-5 md:h-6 hidden sm:block" />
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${locale}/dashboard`}>
                  {tDashboard("title")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-2 min-w-0">
          {/* Search Widget */}
          <SearchWidget locale={locale} />
          
          {/* Desktop-only elements */}
          <div className="hidden md:flex items-center gap-2 md:gap-2">
            <CustomThemeToggle />
            <NotificationDropdown />
            <LocaleSwitcher variant="pill" />
          </div>

          {/* Mobile-optimized elements */}
          <div className="flex items-center gap-2 md:gap-2">
            <div className="md:hidden">
              <NotificationDropdown />
            </div>
            <DashboardUserMenu locale={locale} user={session?.user} />
          </div>
        </div>
      </div>
    </header>
  );
}