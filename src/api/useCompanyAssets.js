import { useEffect, useState } from 'react';
import { getCompanyAssets } from './assets';

export function useCompanyAssets(companyId) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    getCompanyAssets(companyId)
      .then(data => {
        setAssets(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [companyId]);

  return { assets, loading, error };
} 