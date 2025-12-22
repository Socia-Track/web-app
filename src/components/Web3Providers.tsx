import '@rainbow-me/rainbowkit/styles.css'
import React from 'react'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { http } from 'wagmi'
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

// Use environment variable or a placeholder - RainbowKit will work with basic functionality
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f05a7ca2bb7abb24e2d7b700e80f90e'

const wagmiConfig = getDefaultConfig({
  appName: 'SociaTrack',
  projectId,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

interface Web3ProvidersProps {
  children: React.ReactNode
}

export function Web3Providers({ children }: Web3ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
