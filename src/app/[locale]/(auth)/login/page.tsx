import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/layout/login-form-new";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LocaleParams) {
  const { locale } = await params;
  const session = await auth();

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  return <LoginForm locale={locale} />;
}