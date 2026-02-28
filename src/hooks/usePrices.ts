import { useState, useEffect } from 'react';

interface Prices {
  ETH: number;
  MATIC: number;
  BNB: number;
  [key: string]: number;
}

interface UsePricesReturn {
  prices: Prices;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Default fallback prices
const DEFAULT_PRICES: Prices = {
  ETH: 2500,
  MATIC: 0.5,
  BNB: 300
};

export function usePrices(): UsePricesReturn {
  const [prices, setPrices] = useState<Prices>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/prices', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      const data = await response.json();
      setPrices({ ...DEFAULT_PRICES, ...data.prices });
      setError(null);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep using fallback prices
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error, refetch: fetchPrices };
}
