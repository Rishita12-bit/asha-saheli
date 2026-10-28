import { useEffect, useState } from 'react';
import { isSimulatedOffline, setSimulatedOffline } from '../utils/storage';

export function useOnlineStatus() {
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulated, setIsSimulated] = useState(isSimulatedOffline());

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulateOffline = () => {
    const next = !isSimulated;
    setIsSimulated(next);
    setSimulatedOffline(next);
  };

  // Effective status: online only if browser is online AND simulation is off
  const isOnline = isBrowserOnline && !isSimulated;

  return {
    isOnline,
    isBrowserOnline,
    isSimulated,
    toggleSimulateOffline,
  };
}
