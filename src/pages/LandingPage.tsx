"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Bot, Zap, Link2, Wallet, Brain, Rocket, Puzzle, Lock, CheckCircle2, ArrowRight } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DashboardPreview from "@/components/DashboardPreview"
import { PlatformShowcase } from "@/components/PlatformShowcase"
import { TestimonialsMarquee } from "@/components/TestimonialsMarquee"

export default function Home() {
  const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.sociatrack.com'

  const handleGetStarted = () => {
    window.location.href = `${APP_URL}/auth?mode=signup`
  }

  const handleLogin = () => {
    window.location.href = `${APP_URL}/auth`
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-6 sm:px-8 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-6xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-linear-to-r from-foreground via-muted-foreground to-muted-foreground bg-clip-text text-transparent">
              Turn Your Tweets &
              <br />
              Discord Posts Into On-
              <br />
              Chain Insights
            </h1>
          </motion.div>

          {/* Animated Dashboard Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-10 lg:col-start-2 max-w-6xl mx-auto text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '48px' }}>
                Web3 Marketing Is Broken Without Proof
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Every day, Web3 brands spend hours on Social Media promoting their projects but when the mints or trades start rolling in, no one knows which post actually caused it. Traditional analytics only show impressions and likes. In Web3, you need proof of impact on-chain.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="how-it-works">
        <PlatformShowcase />
      </section>

      {/* Features Section */}
      <section id="features">
        <TestimonialsMarquee 
          title="Everything You Need to Track Web3 Growth"
          description="Comprehensive tools and insights to transform your social media campaigns into measurable blockchain results."
          titleStyle={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
          descriptionStyle={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
          testimonials={[
            {
              author: {
                name: "Attribution Engine",
                handle: "",
                avatar: "https://via.placeholder.com/48/3b82f6/ffffff?text=AI"
              },
              text: "Generate unique trackable links for each platform and person to precisely monitor click-through rates and wallet connections."
            },
            {
              author: {
                name: "Real-Time Monitoring",
                handle: "",
                avatar: "https://via.placeholder.com/48/eab308/ffffff?text=RT"
              },
              text: "Detects live NFT purchases and blockchain transactions from wallets that clicked your campaign links."
            },
            {
              author: {
                name: "Seamless Integrations",
                handle: "",
                avatar: "https://via.placeholder.com/48/10b981/ffffff?text=SI"
              },
              text: "Works seamlessly with Discord servers and Twitter accounts using Alchemy API for Ethereum transaction monitoring."
            },
            {
              author: {
                name: "Wallet-Level Analytics",
                handle: "",
                avatar: "https://via.placeholder.com/48/8b5cf6/ffffff?text=WA"
              },
              text: "Track which specific wallets made NFT purchases after clicking your links and calculate exact ETH revenue attribution."
            },
            {
              author: {
                name: "Actionable Insights",
                handle: "",
                avatar: "https://via.placeholder.com/48/f97316/ffffff?text=AI"
              },
              text: "Identify top-performing platforms and individuals with conversion rates, click analytics, and revenue dashboards. Maximizing ROI."
            },
            {
              author: {
                name: "Secured Platform",
                handle: "",
                avatar: "https://via.placeholder.com/48/ef4444/ffffff?text=SP"
              },
              text: "Protected user authentication and secure API integration with encrypted data storage for your campaign analytics."
            }
          ]}
          className="bg-linear-to-b from-background/30 to-transparent"
        />
      </section>

      {/* Pricing/CTA Section */}
      <section id="pricing" className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Start Tracking What Truly Matters
            </h2>
            <p className="text-xl text-gray-600 mb-8" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Join our early access waitlist and be among the first 100 users to experience SociaTrack - free during beta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="text-lg px-8" onClick={handleGetStarted}>
                Request Early Access
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" onClick={handleGetStarted}>
                Book a Live Demo
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Join 200+ Web3 teams already using SociaTrack to track their social-to-chain performance.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}