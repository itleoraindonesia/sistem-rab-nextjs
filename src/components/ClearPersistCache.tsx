'use client';

import { useEffect } from 'react';

// Component to clean up persisted cache from localStorage
// Run this once to clear old persist data
export default function ClearPersistCache() {
  useEffect(() => {
    // Clear old persist cache from localStorage
    const keysToRemove = [
      'sistem-rab-query-cache',
      'react-query-cache',
      'tanstack-query-cache'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`[ClearPersistCache] Removed ${key} from localStorage`);
      }
    });
  }, []);

  return null;
}
