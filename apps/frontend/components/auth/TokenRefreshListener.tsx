"use client";

import { useEffect } from 'react';
import showToast from '../ui/toast';

/**
 * Component that listens for token refresh events and shows notifications
 * Should be included in the app layout
 */
export default function TokenRefreshListener() {
  useEffect(() => {
    // Handler for successful token refresh
    const handleTokenRefresh = () => {
      // Show subtle notification
      showToast.info('Your session has been refreshed');
    };

    // Handler for failed token refresh
    const handleTokenRefreshFailed = () => {
      showToast.error('Session expired. Please login again.');
    };

    // Add event listeners
    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed);

    // Clean up listeners on unmount
    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
