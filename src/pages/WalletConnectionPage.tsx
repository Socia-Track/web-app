"use client"

import React, { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Wallet, Shield, ArrowRight, CheckCircle, QrCode, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QRCode from "qrcode"

export default function WalletConnectionPage() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get the tracking parameters from URL
  const linkId = searchParams.get('linkId')
  const originalUrl = searchParams.get('url')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showMobileQR, setShowMobileQR] = useState(false)
  const [manualWallet, setManualWallet] = useState('')

  // Generate QR code for mobile wallet flow
  useEffect(() => {
    if (linkId && originalUrl) {
      // Use the backend URL to generate mobile wallet link since it should be publicly accessible (ngrok)
      const backendUrl = import.meta.env.VITE_API_URL || 'https://api.sociatrack.com'
      const mobileWalletUrl = `${backendUrl}/mobile-wallet?linkId=${linkId}&url=${encodeURIComponent(originalUrl)}`
      
      QRCode.toDataURL(mobileWalletUrl, { 
        width: 256,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#000000'
        }
      })
        .then(url => {
          setQrCodeUrl(url)
        })
        .catch(err => {
          console.error('Error generating QR code:', err)
        })
    }
  }, [linkId, originalUrl])

  // Effect to handle wallet connection and redirection
  useEffect(() => {
    if (isConnected && address && originalUrl && !isRedirecting) {
      setIsRedirecting(true)
      
      // Save the wallet address to the backend
      const saveWalletAddress = async () => {
        // Additional safety check to ensure we don't send null/undefined addresses
        if (!address || address.trim() === '') {
          console.warn('Skipping wallet address save: address is null or empty')
          return
        }

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.sociatrack.com'}/api/tracking/wallet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              linkId: linkId,
              walletAddress: address
            })
          })

          if (response.ok) {
            console.log('Wallet address saved successfully')
          }
        } catch (error) {
          console.error('Error saving wallet address:', error)
        }
      }

      // Save wallet address and redirect after a short delay
      saveWalletAddress().then(() => {
        setTimeout(() => {
          window.location.href = originalUrl
        }, 1500)
      })
    }
  }, [isConnected, address, originalUrl, linkId, isRedirecting])

  // Show error if no original URL is provided
  if (!originalUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="w-full max-w-md bg-red-900/20 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Invalid Link</CardTitle>
            <CardDescription className="text-red-300">
              This link appears to be invalid or missing required parameters.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show success state when redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="w-full max-w-md bg-green-900/20 border-green-500/20">
            <CardHeader className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-4"
              >
                <CheckCircle className="w-16 h-16 text-green-400" />
              </motion.div>
              <CardTitle className="text-green-400">Wallet Connected!</CardTitle>
              <CardDescription className="text-green-300">
                Redirecting you to the destination...
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mx-auto mb-4 p-4 rounded-full bg-blue-500/20 border border-blue-500/30"
              >
                <Wallet className="w-8 h-8 text-blue-400" />
              </motion.div>
              
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Connect Your Wallet
              </CardTitle>
              
              <CardDescription className="text-gray-700 text-sm">
                To continue to your destination, please connect your wallet. 
                We only collect your wallet address for analytics purposes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Secure & Private" },
                  { icon: ArrowRight, text: "Quick Connection" },
                  { icon: CheckCircle, text: "No Personal Data Stored" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <feature.icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <span className="text-sm text-gray-700">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Connect Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="pt-4"
              >
                {!isConnected ? (
                  <div className="flex flex-col gap-4">
                    {/* Desktop Wallet Connection */}
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                      }) => {
                        const ready = mounted && authenticationStatus !== 'loading'
                        const connected =
                          ready &&
                          account &&
                          chain &&
                          (!authenticationStatus ||
                            authenticationStatus === 'authenticated')

                        return (
                          <div
                            {...(!ready && {
                              'aria-hidden': true,
                              'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                              },
                            })}
                          >
                            {(() => {
                              if (!connected) {
                                return (
                                  <Button
                                    onClick={openConnectModal}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                                    size="lg"
                                  >
                                    <Wallet className="w-5 h-5 mr-2" />
                                    Connect Browser Wallet
                                  </Button>
                                )
                              }

                              return (
                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={openAccountModal}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    size="lg"
                                  >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Connected: {account.displayName}
                                  </Button>
                                  
                                  <Button
                                    onClick={() => disconnect()}
                                    variant="outline"
                                    className="w-full border-white/20 text-gray-900 hover:bg-white/10"
                                    size="sm"
                                  >
                                    Disconnect
                                  </Button>
                                </div>
                              )
                            })()}
                          </div>
                        )
                      }}
                    </ConnectButton.Custom>

                    {/* Mobile QR Code Option */}
                    <div className="border-t border-white/10 pt-4">
                      <Button
                        onClick={() => setShowMobileQR(!showMobileQR)}
                        variant="outline"
                        className="w-full border-white/20 text-gray-900 hover:bg-white/10"
                        size="lg"
                      >
                        <Smartphone className="w-5 h-5 mr-2" />
                        Use Mobile Wallet
                      </Button>
                      
                      {showMobileQR && qrCodeUrl && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 text-center"
                        >
                          <p className="text-sm text-gray-600 mb-3">
                            Scan this QR code with your phone to open MetaMask mobile
                          </p>
                          <div className="flex justify-center mb-3">
                            <img src={qrCodeUrl} alt="Mobile Wallet QR Code" className="w-48 h-48 rounded-lg" />
                          </div>
                          <p className="text-xs text-gray-500">
                            This will open a mobile-friendly page where you can get your wallet address from MetaMask mobile
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Manual wallet address fallback */}
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-sm text-gray-700 mb-3 text-center">
                        Or paste your wallet address directly:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="0x..."
                          value={manualWallet}
                          onChange={(e) => setManualWallet(e.target.value)}
                          className="flex-1 bg-black/30 border border-white/10 px-3 py-2 rounded text-white placeholder:text-gray-500"
                        />
                        <Button
                          onClick={async () => {
                            const addr = manualWallet.trim()
                            if (!addr) {
                              alert('Please enter a valid wallet address')
                              return
                            }

                            if (!addr.match(/^0x[a-fA-F0-9]{40}$/)) {
                              alert('Please enter a valid wallet address (starts with 0x and 42 characters long)')
                              return
                            }

                            try {
                              const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.sociatrack.com'}/api/tracking/wallet`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ linkId: linkId, walletAddress: addr })
                              })
                              
                              if (response.ok) {
                                // Redirect to original URL
                                window.location.href = originalUrl || '/'
                              } else {
                                alert('Failed to save wallet address')
                              }
                            } catch (err) {
                              console.error('Error saving manual wallet address', err)
                              alert('Failed to save wallet address')
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Wallet Connected</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Processing your connection...
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Destination Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="pt-4 border-t border-white/10"
              >
                <p className="text-xs text-gray-500 text-center">
                  After connecting, you'll be redirected to:
                </p>
                <p className="text-sm text-gray-700 text-center mt-1 truncate">
                  {originalUrl}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}