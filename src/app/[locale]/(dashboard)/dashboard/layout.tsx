import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomSidebarProvider, Sidebar, CustomSidebarInset } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <CustomSidebarProvider>
      <Sidebar locale={locale} session={session} />
      <CustomSidebarInset locale={locale}>
        <div className="relative flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <Header locale={locale} session={session} />
          {children}
        </div>
      </CustomSidebarInset>
    </CustomSidebarProvider>
  );
}