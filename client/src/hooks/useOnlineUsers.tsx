import { useState, useEffect } from 'react';

export function useOnlineUsers() {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    // Get count from simplified API endpoint - always returns 1 as requested
    fetch('/api/online')
      .then(res => res.json())
      .then(data => setOnlineCount(data.count))
      .catch(() => setOnlineCount(1)); // Fallback to 1 user
  }, []);

  return onlineCount;
}