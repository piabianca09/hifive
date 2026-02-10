'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';

export default function DashboardWrapper() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { user, userRole } = useAuthStore();

  useEffect(() => {
    // Redirect to sign-in if not authenticated after loading
    if (!isLoading && !user) {
      router.push('/auth/sign-in');
    }
    // Redirect members to profile page
    if (!isLoading && userRole === 'member') {
      router.push('/profile');
    }
  }, [isLoading, user, userRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {(userRole === 'superadmin' || userRole === 'admin') && <AdminDashboard />}
        {userRole === 'staff' && <StaffDashboard />}
      </div>
    </>
  );
}
