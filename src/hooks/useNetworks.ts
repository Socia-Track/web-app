import { useState, useEffect } from 'react';

export interface NetworkInfo {
  key: string;
  name: string;
  chainId: number;
  currency: string;
  explorerUrl: string;
}

interface UseNetworksResponse {
  networks: NetworkInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useNetworks = (): UseNetworksResponse => {
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/multi-chain/networks`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.networks) {
        setNetworks(data.networks);
      } else {
        throw new Error(data.error || 'Failed to fetch networks');
      }
    } catch (err) {
      console.error('Error fetching networks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch networks');
      
      // Fallback to default networks if API fails
      setNetworks([
        {
          key: 'ethereum',
          name: 'Ethereum Mainnet',
          chainId: 1,
          currency: 'ETH',
          explorerUrl: 'https://etherscan.io'
        },
        {
          key: 'polygon',
          name: 'Polygon Mainnet',
          chainId: 137,
          currency: 'MATIC',
          explorerUrl: 'https://polygonscan.com'
        },
        {
          key: 'arbitrum',
          name: 'Arbitrum Mainnet',
          chainId: 42161,
          currency: 'ETH',
          explorerUrl: 'https://arbiscan.io'
        },
        {
          key: 'base',
          name: 'Base Mainnet',
          chainId: 8453,
          currency: 'ETH',
          explorerUrl: 'https://basescan.org'
        },
        {
          key: 'solana',
          name: 'Solana Mainnet',
          chainId: 101,
          currency: 'SOL',
          explorerUrl: 'https://solscan.io'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const refetch = async () => {
    await fetchNetworks();
  };

  return {
    networks,
    loading,
    error,
    refetch
  };
};