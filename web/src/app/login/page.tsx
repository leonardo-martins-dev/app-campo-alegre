import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-800 to-sky-600 p-4">
      <Suspense fallback={<div className="text-white">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
