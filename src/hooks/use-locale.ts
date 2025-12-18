"use client";

import { useLocale as useNextIntlLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

export function useLocale() {
  const locale = useNextIntlLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (newLocale: string) => {
    startTransition(() => {
      // Remove the current locale prefix from pathname
      const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");
      // Add the new locale prefix
      router.push(`/${newLocale}${pathnameWithoutLocale}`);
    });
  };

  return {
    locale,
    changeLocale,
    isPending,
    isRTL: locale === "ar",
    isLTR: locale === "en",
  };
}
