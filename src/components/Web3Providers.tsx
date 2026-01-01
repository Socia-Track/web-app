import React from 'react'
import { isAdminSubdomain } from '@/lib/subdomain-utils'

interface Web3ProvidersProps {
  children: React.ReactNode
}

// Create a simple passthrough component for admin domains
function AdminPassthrough({ children }: Web3ProvidersProps) {
  return <>{children}</>;
}

// Lazy load the actual Web3 providers only when needed
const ActualWeb3Providers = React.lazy(async () => {
  if (isAdminSubdomain()) {
    return { default: AdminPassthrough };
  }
  
  // Dynamic imports to prevent loading Web3 libraries on admin domain
  const [
    { default: rainbowKitStyles },
    { RainbowKitProvider, getDefaultConfig },
    { WagmiProvider },
    { http },
    chains,
    { QueryClientProvider, QueryClient }
  ] = await Promise.all([
    import('@rainbow-me/rainbowkit/styles.css'),
    import('@rainbow-me/rainbowkit'),
    import('wagmi'),
    import('wagmi'),
    import('wagmi/chains'),
    import('@tanstack/react-query')
  ]);

  const { mainnet, polygon, optimism, arbitrum, base, bsc, sepolia } = chains;
  
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f05a7ca2bb7abb24e2d7b700e80f90e';
  
  const wagmiConfig = getDefaultConfig({
    appName: 'SociaTrack',
    projectId,
    chains: [mainnet, polygon, optimism, arbitrum, base, bsc, sepolia],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [optimism.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
      [bsc.id]: http(),
      [sepolia.id]: http(),
    },
  });

  const queryClient = new QueryClient();

  function RealWeb3Providers({ children }: Web3ProvidersProps) {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  }
  
  return { default: RealWeb3Providers };
});

export function Web3Providers({ children }: Web3ProvidersProps) {
  // If admin domain, return passthrough immediately
  if (isAdminSubdomain()) {
    return <AdminPassthrough>{children}</AdminPassthrough>;
  }
  
  // Otherwise use lazy loaded Web3 providers
  return (
    <React.Suspense fallback={<div>Loading Web3...</div>}>
      <ActualWeb3Providers>{children}</ActualWeb3Providers>
    </React.Suspense>
  );
}
