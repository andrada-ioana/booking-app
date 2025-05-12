import { useEffect, useState } from 'react';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerUp, setIsServerUp] = useState(true);

  // Detect browser offline/online
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Detect server availability
  useEffect(() => {
    const checkServer = () => {
      fetch(`${process.env.REACT_APP_API_URL}/api/hotels`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      )
        .then(res => setIsServerUp(res.ok))
        .catch(() => setIsServerUp(false));
    };

    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync queued operations
  useEffect(() => {
    if (isOnline && isServerUp) {
      const queued = JSON.parse(localStorage.getItem("offlineQueue") || "[]");

      queued.forEach(async (op) => {
        try {
          const fetchOptions = {
            method: op.method,
            headers: { "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}` // Include token in headers
             }
          };
      
          if (op.method !== "DELETE") {
            fetchOptions.body = JSON.stringify(op.data);
          }
      
          await fetch(`${process.env.REACT_APP_API_URL}/api/hotels${op.url || ""}`, fetchOptions);
        } catch (err) {
          console.error("Failed to replay operation", op);
        }
      });

      localStorage.removeItem("offlineQueue");
    }
  }, [isOnline, isServerUp]);

  // Export functions
  const queueOperation = (method, data, url = "") => {
    const ops = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    ops.push({ method, data, url });
    localStorage.setItem("offlineQueue", JSON.stringify(ops));
  };

  return { isOnline, isServerUp, queueOperation };
}
