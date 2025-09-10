import { useEffect, useState } from 'react';
import { getDashboardStats } from './dashboard';

export function useDashboardStats(companyId) {
  const [stats, setStats] = useState({ assetCount: 0, ticketCount: 0, equipmentCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDashboardStats(companyId)
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [companyId]);

  return { stats, loading, error };
} 