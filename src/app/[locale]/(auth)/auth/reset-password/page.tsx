import { ResetPasswordForm } from "@/components/auth/reset-password-form";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export default async function ResetPasswordPage({ params }: LocaleParams) {
  const { locale } = await params;
  return <ResetPasswordForm locale={locale} />;
}
