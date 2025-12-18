import { loadMessages, locales } from '@/i18n';
import { Providers } from '@/components/layout/providers';
import { Toaster } from "@/components/ui/sonner";
import { DirectionSetter } from '@/components/layout/direction-setter';

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as typeof locales[number])) {
    // Handle invalid locale - will be handled by middleware
  }

  const messages = await loadMessages(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      <Providers messages={messages} locale={locale}>
        <DirectionSetter dir={dir} locale={locale} />
        {children}
        <Toaster position="top-center" />
      </Providers>
    </>
  );
}
