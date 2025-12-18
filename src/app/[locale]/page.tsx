import { LandingPage } from '@/components/landing/landing-page';

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: LocaleParams) {
  const { locale } = await params;
  return <LandingPage locale={locale} />;
}