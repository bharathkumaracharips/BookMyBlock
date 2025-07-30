import React from 'react';
import { Toaster } from 'sonner';

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
