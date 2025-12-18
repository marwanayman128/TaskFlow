import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DynamicAnimation } from '@/components/layout/dynamic-animation';
export default async function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-primary/5 to-background p-4">
      <Card className="text-card-foreground flex flex-col gap-6 py-6 group relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-xl max-w-2xl w-full">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary-500/5 via-transparent to-primary-500/5 transition duration-500" />
        <div className="pointer-events-none absolute -right-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary-500/10 blur-3xl" />

        <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 relative text-center pb-6">
          <div className="mx-auto mb-4 w-48 h-48">
            <DynamicAnimation animationUrl="/animations/page-not-found-error-illustration-2025-10-20-23-53-12-utc.json" />
          </div>
          <CardTitle className="text-4xl font-bold text-foreground mb-2">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            The page you`re looking for doesn`t exist.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 relative text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full px-6 py-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
            >
              <a href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </a>
            </Button>
            <Button
              asChild
              className="rounded-full px-6 py-3 bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            If you think this is an error, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}