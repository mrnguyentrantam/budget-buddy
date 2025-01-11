'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
  import { Toaster } from 'react-hot-toast';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      redirect('/auth');
    }
  }, []);

  return (
    <main className="min-h-screen pb-16">
      {children}
      <BottomNavigation />
      <Toaster position="top-center" />
    </main>
  );
} 