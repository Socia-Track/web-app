import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNetworks, NetworkInfo } from '@/hooks/useNetworks';

interface NetworkSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showChainId?: boolean;
  showCurrency?: boolean;
  className?: string;
  required?: boolean;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  value,
  onValueChange,
  label = 'Blockchain',
  placeholder = 'Select blockchain',
  disabled = false,
  showChainId = false,
  showCurrency = true,
  className = '',
  required = false
}) => {
  const { networks, loading: networksLoading, error: networksError } = useNetworks();

  const formatNetworkLabel = (network: NetworkInfo) => {
    const parts = [network.name];
    
    if (showCurrency) {
      parts.push(`(${network.currency})`);
    }
    
    if (showChainId) {
      parts.push(`Chain ID: ${network.chainId}`);
    }
    
    return parts.join(' ');
  };

  const getSelectedNetwork = () => {
    return networks.find(network => network.key === value);
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="blockchain-select" className="text-foreground">
          {label} {required && '*'}
        </Label>
      )}
      <Select 
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || networksLoading}
      >
        <SelectTrigger 
          id="blockchain-select"
          className="mt-2"
        >
          <SelectValue 
            placeholder={
              networksLoading 
                ? "Loading networks..." 
                : placeholder
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => (
            <SelectItem 
              key={network.key} 
              value={network.key}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{network.name}</span>
                  {(showCurrency || showChainId) && (
                    <span className="text-xs text-muted-foreground">
                      {showCurrency && network.currency}
                      {showCurrency && showChainId && ' • '}
                      {showChainId && `Chain ID: ${network.chainId}`}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {networksError && (
        <p className="text-sm text-red-400 mt-1">
          {networksError} - Using fallback networks
        </p>
      )}
      {value && (
        <div className="mt-2 text-xs text-muted-foreground">
          {getSelectedNetwork() && (
            <div className="flex items-center gap-2">
              <span>Selected: {getSelectedNetwork()?.name}</span>
              <span>•</span>
              <span>Currency: {getSelectedNetwork()?.currency}</span>
              <span>•</span>
              <span>Chain ID: {getSelectedNetwork()?.chainId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;