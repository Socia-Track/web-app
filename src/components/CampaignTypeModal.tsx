"use client"

import { motion } from "framer-motion"
import { X, Zap, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CampaignTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectNFT: () => void
  onSelectToken: () => void
}

export default function CampaignTypeModal({
  isOpen,
  onClose,
  onSelectNFT,
  onSelectToken
}: CampaignTypeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl bg-gray-50 border border-gray-200 p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Campaign Type</h2>
          <p className="text-lg text-gray-600">Select the type of campaign you want to create</p>
        </div>

        {/* Campaign Type Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* NFT Campaign */}
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectNFT}
            className="group relative p-8 rounded-xl border border-gray-200 bg-white hover:border-[#00D9A3] hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon with gradient background */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#7C3AED]/10 flex items-center justify-center mb-4 group-hover:from-[#00D9A3]/20 group-hover:to-[#00D9A3]/10 transition-all">
                <Zap className="w-8 h-8 text-[#7C3AED] group-hover:text-[#00D9A3] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">NFT Campaign</h3>
              <p className="text-sm text-gray-600">
                Track NFT collection or single NFT purchases
              </p>
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-[#00D9A3]/0 group-hover:border-[#00D9A3]/20 transition-all" />
          </motion.button>

          {/* Token Campaign */}
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectToken}
            className="group relative p-8 rounded-xl border border-gray-200 bg-white hover:border-[#00D9A3] hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon with gradient background */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 flex items-center justify-center mb-4 group-hover:from-[#00D9A3]/20 group-hover:to-[#00D9A3]/10 transition-all">
                <LinkIcon className="w-8 h-8 text-[#3B82F6] group-hover:text-[#00D9A3] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Token Campaign</h3>
              <p className="text-sm text-gray-600">
                Track ERC20 token purchases on DEX
              </p>
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-[#00D9A3]/0 group-hover:border-[#00D9A3]/20 transition-all" />
          </motion.button>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-200 text-gray-700"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
