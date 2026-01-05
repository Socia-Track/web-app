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
      { text: "Up to 3 campaigns", included: true },
      { text: "2 links per campaign", included: true },
      { text: "Basic analytics", included: true },
      { text: "Support", included: true }
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Pro",
    price: "$299",
    period: "per month",
    description: "For serious Web3 marketers",
    features: [
      { text: "25 campaigns", included: true },
      { text: "4 links per campaign", included: true },
      { text: "Download report", included: true },
      { text: "Multi-chain support", included: true }
    ],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "per month",
    description: "For large teams and agencies",
    features: [
      { text: "50 campaigns", included: true },
      { text: "6 links per campaign", included: true },
      { text: "Download report", included: true },
      { text: "Multi-chain support", included: true },
      { text: "Early access to our V2", included: true }
    ],
    cta: "Get Started",
    popular: false
  }
]

export default function PricingPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [signupOpen, setSignupOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePlanSelect = (planName: string) => {
    console.log('🔵 Button clicked! Plan:', planName)
    
    // Create email subject and body based on plan
    const subject = encodeURIComponent(`${planName} Plan Inquiry`)
    const body = encodeURIComponent(
      `Hi SociaTrack Team,\n\nI'm interested in the ${planName} plan.\n\nBest regards`
    )

    // Open email client with pre-filled To, Subject, and Body
    const mailtoLink = `mailto:contact@sociatrack.com?subject=${subject}&body=${body}`
    console.log('🔵 Mailto link:', mailtoLink)
    
    // Try opening email client
    const link = document.createElement('a')
    link.href = mailtoLink
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('🔵 Link clicked!')
    
    // Detect if email client didn't open (fallback after 1 second)
    setTimeout(() => {
      // If we're still here, email client didn't open
      toast.info('No email client detected', {
        description: 'Click to copy our email address or contact us directly',
        action: {
          label: 'Copy Email',
          onClick: () => {
            navigator.clipboard.writeText('contact@sociatrack.com')
            toast.success('Copied! Email us at contact@sociatrack.com')
          }
        },
        duration: 8000,
      })
    }, 1000)
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
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
                className={`relative border rounded-2xl p-8 ${plan.popular
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
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period !== "contact us" && (
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <Button
                  className={`w-full mb-8 ${plan.popular
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
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
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