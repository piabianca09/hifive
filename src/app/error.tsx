'use client';

import ComingSoon from '@/components/common/ComingSoon';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f9f2f7] to-[#e8e4d5]">
      <ComingSoon />
    </div>
  );
}