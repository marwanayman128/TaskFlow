import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: LocaleParams) {
  const { locale } = await params;
  const session = await auth();

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  return <RegisterForm locale={locale} />;
}
