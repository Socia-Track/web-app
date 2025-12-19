import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function MobileWalletPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const linkId = searchParams.get('linkId');
  const originalUrl = searchParams.get('url');

  const openMetaMask = () => {
    // Try to open MetaMask mobile app
    const metamaskUrl = 'https://metamask.app.link/';
    window.open(metamaskUrl, '_blank');
    setStep(2);
  };

  const submitWalletAddress = async () => {
    if (!walletAddress.trim()) {
      alert('Please enter your wallet address');
      return;
    }

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Please enter a valid wallet address (starts with 0x and 42 characters long)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tracking/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
          walletAddress: walletAddress.trim(),
        }),
      });

      if (response.ok) {
        // Redirect to original URL
        if (originalUrl) {
          window.location.href = originalUrl;
        } else {
          alert('Wallet address saved successfully!');
        }
      } else {
        const errorText = await response.text();
        console.error('Error saving wallet address:', errorText);
        alert('Error saving wallet address. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Get Your Wallet Address
          </h1>
          <p className="text-gray-600">
            We need your wallet address to continue
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step 1: Open MetaMask
              </h2>
              <p className="text-gray-600 mb-6">
                Tap the button below to open MetaMask mobile app
              </p>
              <button
                onClick={openMetaMask}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Open MetaMask App</span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Don't have MetaMask? 
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Download it here
                </a>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step 2: Copy Your Address
              </h2>
              <div className="text-gray-600 mb-6 text-left">
                <p className="mb-2">In MetaMask app:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Tap your account name at the top</li>
                  <li>Tap "Copy" next to your address</li>
                  <li>Return to this page</li>
                  <li>Paste your address below</li>
                </ol>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <button
                onClick={submitWalletAddress}
                disabled={isSubmitting || !walletAddress.trim()}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to Step 1
            </button>
          </div>
        )}
      </div>
    </div>
  );
}