import { Suspense } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import LoginForm from './LoginForm';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LoginPage() {
  return (
    <AuthLayout footer={<LoginFooter />}>
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

function LoginFooter() {
  return (
    <p className="text-xs text-slate-500">
      Ao continuar, você concorda com a{' '}
      <a href="/privacidade" className="text-primary hover:underline">
        Política de Privacidade
      </a>
      .
    </p>
  );
}

function LoginSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
