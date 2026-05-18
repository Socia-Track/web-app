import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Wallet, Activity } from 'lucide-react';

interface NFTRevenueTrackerProps {
  campaignId: string;
  campaign: {
    contractAddress?: string;
    promotionType?: string;
    tokenIds?: string[];
    network?: string;
  };
  onUpdate: (data: any) => void;
}

export default function NFTRevenueTracker({ campaignId, campaign, onUpdate }: NFTRevenueTrackerProps) {
  const [contractAddress, setContractAddress] = useState(campaign.contractAddress || '');
  const [promotionType, setPromotionType] = useState(campaign.promotionType || 'collection');
  const [tokenIds, setTokenIds] = useState(campaign.tokenIds?.join(', ') || '');
  const [network] = useState('ethereum'); // Only Ethereum supported
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(!!campaign.contractAddress);

  const handleSaveConfiguration = async () => {
    if (!contractAddress.trim()) {
      toast.error('Please enter a contract address');
      return;
    }

    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      toast.error('Please enter a valid Ethereum contract address (0x...)');
      return;
    }

    if (promotionType === 'single' && !tokenIds.trim()) {
      toast.error('Please enter token IDs for single NFT promotion');
      return;
    }

    setIsLoading(true);

    try {
      const tokenIdArray = promotionType === 'single' 
        ? tokenIds.split(',').map(id => id.trim()).filter(id => id.length > 0)
        : [];

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: contractAddress.trim(),
          promotionType,
          tokenIds: tokenIdArray,
          network: 'ethereum',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign configuration');
      }

      const updatedCampaign = await response.json();
      
      setIsConfigured(true);
      toast.success('NFT revenue tracking configured successfully!');
      onUpdate(updatedCampaign);

      // Start monitoring
      await startRevenueMonitoring();

    } catch (error) {
      console.error('Error configuring NFT tracking:', error);
      toast.error('Failed to configure NFT tracking');
    } finally {
      setIsLoading(false);
    }
  };

  const startRevenueMonitoring = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/start-monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Revenue monitoring started successfully!');
      } else {
        toast.error('Failed to start revenue monitoring');
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error('Error starting revenue monitoring');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          NFT Revenue Tracking
        </CardTitle>
        <CardDescription>
          Configure real-time NFT purchase tracking using the Alchemy API for Ethereum network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isConfigured && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              NFT revenue tracking is configured and monitoring transactions every 5 minutes
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contract Address */}
          <div className="space-y-2">
            <Label htmlFor="contractAddress">NFT Contract Address *</Label>
            <Input
              id="contractAddress"
              type="text"
              placeholder="0x1234567890abcdef..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              The Ethereum contract address of your NFT collection
            </p>
          </div>

          {/* Network */}
          <div className="space-y-2">
            <Label>Network</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Ethereum</Badge>
              <span className="text-sm text-muted-foreground">Only Ethereum is supported</span>
            </div>
          </div>
        </div>

        {/* Promotion Type */}
        <div className="space-y-2">
          <Label htmlFor="promotionType">Promotion Type *</Label>
          <Select value={promotionType} onValueChange={setPromotionType} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select promotion type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="collection">
                <div className="flex flex-col">
                  <span>Collection Promotion</span>
                  <span className="text-sm text-muted-foreground">Track ANY NFT purchase from the collection</span>
                </div>
              </SelectItem>
              <SelectItem value="single">
                <div className="flex flex-col">
                  <span>Single NFT Promotion</span>
                  <span className="text-sm text-muted-foreground">Track specific NFT token IDs only</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Token IDs (only for single NFT promotion) */}
        {promotionType === 'single' && (
          <div className="space-y-2">
            <Label htmlFor="tokenIds">Token IDs *</Label>
            <Input
              id="tokenIds"
              type="text"
              placeholder="1, 2, 3, 42, 100"
              value={tokenIds}
              onChange={(e) => setTokenIds(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated list of specific token IDs to track
            </p>
          </div>
        )}

        {/* How it works */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">How Revenue Tracking Works</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• System monitors wallet addresses that click your campaign links</li>
                <li>• Every 5 minutes, checks for NFT purchases from those wallets</li>
                <li>• Calculates real ETH spent and converts to USD value</li>
                <li>• Updates "Revenue Generated" with actual transaction amounts</li>
                <li>• Excludes gas fees - only counts the actual NFT purchase price</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning for existing campaigns */}
        {!isConfigured && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">Important:</p>
              <p>Configure this before sharing your campaign links. Revenue tracking only works for wallet addresses that click links after configuration.</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSaveConfiguration}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Configuring...' : isConfigured ? 'Update Configuration' : 'Start Revenue Tracking'}
        </Button>
      </CardContent>
    </Card>
  );
}