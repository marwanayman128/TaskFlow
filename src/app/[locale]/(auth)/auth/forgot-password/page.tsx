import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: LocaleParams) {
  const { locale } = await params;
  return <ForgotPasswordForm locale={locale} />;
}
