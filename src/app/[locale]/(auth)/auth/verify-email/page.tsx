'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface VerifyEmailPageProps {
  params: Promise<{ locale: string }>;
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = React.useState('');
  const [locale, setLocale] = React.useState('en');

  React.useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        toast.success('Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Something went wrong');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-2xl border p-8 text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Icon icon="solar:spinner-line-2-bold" className="size-10 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Verifying your email...</h1>
              <p className="text-muted-foreground">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <Icon icon="solar:check-circle-bold" className="size-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
              <p className="text-muted-foreground">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Button
                onClick={() => router.push(`/${locale}/login`)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80"
              >
                Sign In
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Icon icon="solar:danger-triangle-bold" className="size-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-destructive">Verification Failed</h1>
              <p className="text-muted-foreground">{error}</p>
              <div className="space-y-3">
                <Link href={`/${locale}/register`}>
                  <Button variant="outline" className="w-full h-12 rounded-xl">
                    Create New Account
                  </Button>
                </Link>
                <Link href={`/${locale}/login`}>
                  <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80">
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
