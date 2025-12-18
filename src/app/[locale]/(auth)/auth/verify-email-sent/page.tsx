'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface VerifyEmailSentPageProps {
  params: Promise<{ locale: string }>;
}

export default function VerifyEmailSentPage({ params }: VerifyEmailSentPageProps) {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [locale, setLocale] = React.useState('en');

  React.useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-2xl border p-8 text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
          >
            <Icon icon="solar:mailbox-bold-duotone" className="size-12 text-primary" />
          </motion.div>

          {/* Content */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              We've sent a verification link to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">1.</span> Open your email inbox
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">2.</span> Click the verification link
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">3.</span> Start using TaskFlow!
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
              onClick={() => window.open('https://mail.google.com', '_blank')}
            >
              <Icon icon="logos:google-gmail" className="size-5 mr-2" />
              Open Gmail
            </Button>
            
            <Link href={`/${locale}/login`} className="block">
              <Button
                variant="ghost"
                className="w-full h-12 rounded-xl text-muted-foreground"
              >
                Back to Sign In
              </Button>
            </Link>
          </div>

          {/* Didn't receive email */}
          <p className="text-sm text-muted-foreground pt-4 border-t">
            Didn't receive the email? Check your spam folder or{' '}
            <button className="text-primary hover:underline">resend it</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
