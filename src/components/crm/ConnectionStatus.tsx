'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic health check
  const { data: healthCheck, isLoading } = useQuery({
    queryKey: ['connection-health'],
    queryFn: async () => {
      if (!supabase) return false;
      
      try {
        // Simple health check - count users table
        const { error } = await supabase.from('clients').select('id', { count: 'exact', head: true });
        return !error;
      } catch {
        return false;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    retry: 2,
    staleTime: 4 * 60 * 1000,
  });

  const isHealthy = healthCheck ?? true;
  const hasIssue = !isOnline || !isHealthy;

  // Don't show anything if everything is fine and no recent status change
  if (!hasIssue && !showStatus) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      hasIssue ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        hasIssue 
          ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
          : 'bg-green-50 border-green-200 text-green-800'
      }`}>
        {hasIssue ? (
          <>
            {isLoading ? (
              <AlertCircle className="w-5 h-5 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
            <div className="text-sm font-medium">
              {!isOnline ? 'Koneksi terputus' : 'Koneksi database bermasalah'}
            </div>
          </>
        ) : (
          <>
            <Wifi className="w-5 h-5" />
            <div className="text-sm font-medium">Koneksi normal</div>
          </>
        )}
      </div>
    </div>
  );
}
