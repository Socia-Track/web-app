import React from 'react';
import { useNetworks, NetworkInfo } from '@/hooks/useNetworks';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, Coins } from 'lucide-react';

interface NetworkInfoDisplayProps {
  networkKey: string;
  showExplorer?: boolean;
  showChainId?: boolean;
  showCurrency?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
}

export const NetworkInfoDisplay: React.FC<NetworkInfoDisplayProps> = ({
  networkKey,
  showExplorer = false,
  showChainId = false,
  showCurrency = false,
  variant = 'default',
  size = 'default'
}) => {
  const { networks } = useNetworks();
  
  const network = networks.find(n => n.key === networkKey);
  
  if (!network) {
    return (
      <Badge variant="destructive" className="text-xs">
        Unknown Network
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant={variant} className={`
        ${size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : 'text-xs'}
        flex items-center gap-1
      `}>
        <Globe className="w-3 h-3" />
        {network.name}
      </Badge>
      
      {showCurrency && (
        <Badge variant="outline" className={`
          ${size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : 'text-xs'}
          flex items-center gap-1
        `}>
          <Coins className="w-3 h-3" />
          {network.currency}
        </Badge>
      )}
      
      {showChainId && (
        <Badge variant="secondary" className={`
          ${size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : 'text-xs'}
        `}>
          Chain: {network.chainId}
        </Badge>
      )}
      
      {showExplorer && (
        <a
          href={network.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Explorer
        </a>
      )}
    </div>
  );
};

interface NetworkStatsProps {
  className?: string;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ className = '' }) => {
  const { networks, loading, error } = useNetworks();
  
  if (loading) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        Loading network information...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`text-sm text-red-400 ${className}`}>
        Failed to load networks: {error}
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-300">
        Supported Networks ({networks.length})
      </div>
      <div className="flex flex-wrap gap-2">
        {networks.map((network) => (
          <NetworkInfoDisplay
            key={network.key}
            networkKey={network.key}
            showCurrency={true}
            showExplorer={false}
            size="sm"
            variant="outline"
          />
        ))}
      </div>
    </div>
  );
};

export default NetworkInfoDisplay;