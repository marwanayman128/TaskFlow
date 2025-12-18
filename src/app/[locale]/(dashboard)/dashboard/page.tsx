'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * Dashboard root page - redirects to My Day (Any.do default view)
 */
export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Redirect to My Day as the default view (like Any.do)
    router.replace(`/${locale}/dashboard/myday`);
  }, [router, locale]);

  // Show loading state while redirecting
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
