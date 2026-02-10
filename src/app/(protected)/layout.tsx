'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

// Create a wrapper component for the protected layout
const ProtectedLayoutWrapper = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f2f7]">
        <div className="text-[#03034b] text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to sign-in
  if (!user) {
    redirect('/auth/sign-in');
    return null; // This won't be reached due to redirect, but added for type safety
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f9f2f7] to-[#e8e4d5]">
      <Sidebar />
      <main className="flex-1 md:ml-64 pt-16 md:pt-4 pb-4 pl-4 pr-4">
        {children}
      </main>
    </div>
  );
};

// Main layout component
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayoutWrapper>{children}</ProtectedLayoutWrapper>
  );
}