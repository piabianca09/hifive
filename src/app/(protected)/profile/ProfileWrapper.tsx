'use client';

import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import { QRCodeSVG } from 'qrcode.react';

export default function ProfileWrapper() {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-gray-900 capitalize">{userRole}</p>
              </div>

              {userRole === 'member' && user && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-900 mb-4">Check-in QR Code</h2>
                  <p className="text-gray-700 mb-4">
                    Use this QR code to quickly check in with your active membership
                  </p>
                  <div className="bg-white p-4 rounded border-2 border-gray-300 inline-block">
                    <QRCodeSVG
                      value={`hifive-checkin:${user.id}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
