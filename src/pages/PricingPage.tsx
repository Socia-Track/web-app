"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { useState } from "react"
import SignupModal from "@/components/SignupModal"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out SociaTrack",
    features: [
      { text: "Up to 2 campaigns", included: true },
      { text: "100 tracked wallets", included: true },
      { text: "7-day attribution window", included: true },
      { text: "Basic analytics dashboard", included: true },
      { text: "Community support", included: true },
      { text: "Advanced AI attribution", included: false },
      { text: "Real-time monitoring", included: false },
      { text: "Custom integrations", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false }
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For serious Web3 marketers",
    features: [
      { text: "Unlimited campaigns", included: true },
      { text: "1,000 tracked wallets", included: true },
      { text: "30-day attribution window", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Advanced AI attribution", included: true },
      { text: "Real-time monitoring", included: true },
      { text: "Discord & Twitter/X integration", included: true },
      { text: "Export reports (CSV/PDF)", included: true },
      { text: "Email support", included: true },
      { text: "API access", included: false }
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large teams and agencies",
    features: [
      { text: "Unlimited everything", included: true },
      { text: "Unlimited tracked wallets", included: true },
      { text: "90-day attribution window", included: true },
      { text: "Custom analytics dashboard", included: true },
      { text: "Advanced AI attribution", included: true },
      { text: "Real-time monitoring", included: true },
      { text: "All integrations included", included: true },
      { text: "Custom integrations", included: true },
      { text: "Full API access", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Custom training & onboarding", included: true }
    ],
    cta: "Contact Sales",
    popular: false
  }
]

export default function PricingPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [signupOpen, setSignupOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePlanSelect = async (planName: string) => {
    if (planName === "Enterprise") {
      // Create email subject and body
      const subject = encodeURIComponent("Enterprise Plan Inquiry")
      const body = encodeURIComponent(
        `Hi SociaTrack Team,\n\nI'm interested in learning more about the Enterprise plan.\n\nBest regards`
      )
      
      // Try to open in new tab first (iframe compatibility)
      const mailtoLink = `mailto:sales@sociatrack.io?subject=${subject}&body=${body}`
      const isInIframe = window.self !== window.top
      
      if (isInIframe) {
        window.parent.postMessage(
          { type: "OPEN_EXTERNAL_URL", data: { url: mailtoLink } },
          "*"
        )
      } else {
        window.location.href = mailtoLink
      }
      
      toast.success("Opening email client...")
    } else {
      // For Free and Pro plans
      if (!isPending && session?.user) {
        // User is logged in, activate the plan
        setLoading(true)
        
        try {
          const token = localStorage.getItem("bearer_token")
          
          // Create subscription
          const subResponse = await fetch("/api/subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: session.user.uid,
              planName,
              status: planName === "Pro" ? "trial" : "active",
              trialEndsAt: planName === "Pro" 
                ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                : null
            })
          })

          if (!subResponse.ok) {
            throw new Error("Failed to create subscription")
          }

          // Create plan usage record
          const planLimits = {
            Free: {
              campaignsCount: 0,
              attributionWindowDays: 7,
              hasAdvancedAi: false,
              hasRealtimeMonitoring: false,
              hasApiAccess: false
            },
            Pro: {
              campaignsCount: 0,
              attributionWindowDays: 30,
              hasAdvancedAi: true,
              hasRealtimeMonitoring: true,
              hasApiAccess: false
            }
          }

          const limits = planLimits[planName as "Free" | "Pro"]
          
          const usageResponse = await fetch("/api/plan-usage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: session.user.uid,
              planName,
              ...limits
            })
          })

          if (!usageResponse.ok) {
            throw new Error("Failed to create plan usage")
          }

          toast.success(`${planName} plan activated successfully!${planName === "Pro" ? " Your 14-day trial has started." : ""}`)
          navigate("/dashboard")
        } catch (error) {
          console.error("Plan activation error:", error)
          toast.error("Failed to activate plan. Please try again.")
        } finally {
          setLoading(false)
        }
      } else {
        // User not logged in, show signup modal
        setSignupOpen(true)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground">
              Start tracking your Web3 marketing ROI with transparent pricing. No hidden fees.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative border rounded-2xl p-8 ${
                  plan.popular
                    ? "border-primary/30 bg-card"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    {plan.period !== "contact us" && (
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <Button
                  className={`w-full mb-8 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handlePlanSelect(plan.name)}
                  disabled={isPending || loading}
                >
                  {isPending || loading ? "Loading..." : plan.cta}
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                      ) : (
                        <X className="text-muted-foreground/60 flex-shrink-0 mt-0.5" size={20} />
                      )}
                      <span
                        className={
                          feature.included ? "text-foreground" : "text-muted-foreground/60"
                        }
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  question: "Can I switch plans anytime?",
                  answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards (Visa, MasterCard, American Express) and support cryptocurrency payments for Enterprise plans."
                },
                {
                  question: "Is there a free trial?",
                  answer: "Pro plans come with a 14-day free trial. No credit card required. You can also use our Free plan indefinitely to test the platform."
                },
                {
                  question: "What happens if I exceed my wallet limit?",
                  answer: "We'll notify you when you reach 80% of your limit. You can either upgrade your plan or remove inactive wallets to stay within your limit."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked."
                }
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-lg p-6 bg-card"
                >
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      
      <SignupModal open={signupOpen} onOpenChange={setSignupOpen} />
    </div>
  )
}