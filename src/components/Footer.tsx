import { Twitter, Linkedin, X } from "lucide-react"
import { useState } from "react"

export default function Footer() {
  const [showAbout, setShowAbout] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowAbout(false)
      setIsClosing(false)
    }, 300)
  }

  return (
    <>
      {/* About Us Modal */}
      {showAbout && (
        <div 
          className="fixed inset-0 z-50 flex items-end"
          onClick={handleClose}
          onTouchStart={handleClose}
        >
          <div 
            className={`bg-black w-full max-h-[90vh] rounded-t-[60px] p-12 relative overflow-y-auto border-t border-white ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
            onClick={handleClose}
            onTouchStart={handleClose}
          >
            <div className="max-w-4xl mx-auto pt-8 pb-8">
              <h2 className="text-4xl font-bold text-white mb-8">About SociaTrack</h2>
              <div className="text-gray-300 text-lg leading-relaxed space-y-6">
                <p>
                  SociaTrack is an on-chain analytics platform that helps Web3 teams understand the true impact of their marketing and influencer campaigns. Instead of relying on screenshots or self-reported metrics, we provide verifiable on-chain attribution from click → wallet → mint.
                </p>
                <p>
                  We built SociaTrack to solve one of the biggest gaps in Web3 growth: real performance data teams can trust. Today, we support attribution on Ethereum, and we're actively expanding beyond NFTs into tokens, DeFi actions, swaps, and on-chain user journeys across ecosystems.
                </p>
                <p>
                  Our mission is to make Web3 marketing transparent, data-driven, and impossible to fake no matter which chain, token, or protocol your users interact with.
                </p>
                <p>
                  SociaTrack aims to become the industry standard for trustworthy, on-chain growth analytics across NFTs, tokens, DeFi, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">SociaTrack</h3>
              <p className="text-sm text-muted-foreground">
                Where Social Engagement Meets Blockchain Proof.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                {/* <li>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li> */}
                <li>
                  <a href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setShowAbout(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    About
                  </button>
                </li>
                <li>
                  <a href="mailto:contact@sociatrack.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://x.com/sociatrack?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://discord.gg/zssAdhhN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/sociatrack/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="text-base sm:text-lg font-semibold text-muted-foreground">BACKED BY:</span>
              <img 
                src="/google-cloud-startups.png.jpg" 
                alt="Google Cloud for Startups" 
                className="h-56 sm:h-60 md:h-64 w-auto max-w-[280px] sm:max-w-none"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} SociaTrack. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}