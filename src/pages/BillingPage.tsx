"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react"

export default function BillingPage() {
  // Mock data - replace with actual API calls
  const [currentPlan] = useState({
    name: "Pro Plan",
    price: "$49",
    period: "month",
    status: "active",
    nextBilling: "2025-11-23",
    cancelAtPeriodEnd: false
  })

  const [paymentMethod] = useState({
    type: "Visa",
    last4: "4242",
    expiry: "12/2026"
  })

  const [invoices] = useState([
    {
      id: "INV-001",
      date: "2025-10-23",
      amount: "$49.00",
      status: "paid",
      downloadUrl: "#"
    },
    {
      id: "INV-002",
      date: "2025-09-23",
      amount: "$49.00",
      status: "paid",
      downloadUrl: "#"
    },
    {
      id: "INV-003",
      date: "2025-08-23",
      amount: "$49.00",
      status: "paid",
      downloadUrl: "#"
    }
  ])

  const handleManageBilling = () => {
    // Open Stripe billing portal
    console.log("Opening billing portal...")
  }

  const handleChangePlan = () => {
    // Navigate to pricing page
    window.location.href = "/pricing"
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-8 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Billing & Subscription
          </h1>
          <p className="text-gray-400">Manage your subscription and billing information</p>
        </div>

        <div className="space-y-6">
            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 border-white/10 bg-gradient-to-r from-white/5 to-black/50">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{currentPlan.name}</h2>
                      <Badge
                        variant={currentPlan.status === "active" ? "default" : "secondary"}
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        {currentPlan.status}
                      </Badge>
                    </div>
                    <p className="text-gray-400">
                      <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {currentPlan.price}
                      </span>
                      <span className="text-lg"> / {currentPlan.period}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangePlan}
                    className="border-white/20"
                  >
                    Change Plan
                    <ArrowUpRight size={16} className="ml-2" />
                  </Button>
                </div>

                {!currentPlan.cancelAtPeriodEnd && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={16} />
                    <span>Next billing date: {currentPlan.nextBilling}</span>
                  </div>
                )}

                {currentPlan.cancelAtPeriodEnd && (
                  <div className="flex items-center gap-2 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <AlertCircle size={20} className="text-orange-400" />
                    <span className="text-orange-400">
                      Your subscription will be canceled on {currentPlan.nextBilling}
                    </span>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Payment Method Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 border-white/10 bg-gradient-to-r from-white/5 to-black/50">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">Payment Method</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    className="border-white/20"
                  >
                    Update
                  </Button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="p-3 bg-gradient-to-r from-white to-gray-300 rounded-lg">
                    <CreditCard size={24} className="text-black" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {paymentMethod.type} ending in {paymentMethod.last4}
                    </p>
                    <p className="text-sm text-gray-400">
                      Expires {paymentMethod.expiry}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Usage & Limits Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 border-white/10 bg-gradient-to-r from-white/5 to-black/50">
                <h3 className="text-xl font-semibold mb-6">Current Usage</h3>

                <div className="space-y-6">
                  {[
                    { label: "Campaigns", used: 8, limit: "Unlimited", percentage: 0 },
                    { label: "API Calls", used: 12453, limit: 50000, percentage: 24.9 },
                    { label: "Data Storage", used: 2.3, limit: 10, percentage: 23, unit: "GB" }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="text-gray-400">
                          {item.used} {item.unit || ""} / {item.limit} {item.unit || ""}
                        </span>
                      </div>
                      {item.percentage > 0 && (
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-white to-gray-300 h-2 rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Billing History Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 border-white/10 bg-gradient-to-r from-white/5 to-black/50">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-xl font-semibold">Billing History</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    className="border-white/20"
                  >
                    View All
                  </Button>
                </div>

                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-r from-white to-gray-300 rounded-lg">
                          <Download size={20} className="text-black" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-gray-400">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{invoice.amount}</span>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          {invoice.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log("Download", invoice.id)}
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Manage Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="p-6 border-white/10 bg-gradient-to-r from-white/5 to-black/50">
                <h3 className="text-xl font-semibold mb-4">Manage Subscription</h3>
                <p className="text-gray-400 mb-6">
                  Update payment methods, view invoices, or cancel your subscription through our
                  secure billing portal.
                </p>
                <Button
                  size="lg"
                  onClick={handleManageBilling}
                  className="bg-gradient-to-r from-white to-gray-300 text-black hover:from-gray-100 hover:to-gray-400"
                >
                  Open Billing Portal
                  <ArrowUpRight size={18} className="ml-2" />
                </Button>
              </Card>
            </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}