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

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'b18e2469e62d5edfbbb72b6e3e284f20'

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
