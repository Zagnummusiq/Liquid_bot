import React, { useState, useEffect } from 'react';

const AdblockDetector: React.FC = () => {
  const [isAdblockEnabled, setIsAdblockEnabled] = useState(false);

  useEffect(() => {
    const checkAdblock = async () => {
      // Common Monetag/Ad script URL that usually gets blocked
      const url = 'https://libtl.com/sdk.js';
      try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        setIsAdblockEnabled(false);
      } catch (error) {
        setIsAdblockEnabled(true);
      }
    };

    checkAdblock();
    // Periodically re-check
    const interval = setInterval(checkAdblock, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isAdblockEnabled) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-botlife-secondary p-8 rounded-2xl border border-red-500/30">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Neural Block Detected</h2>
        <p className="text-gray-400 mb-8">
          Our neural engineering systems require an active ad connection to synchronize with the network. Please disable your adblocker to continue using Botlife.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
        >
          I've Disabled It - Refresh
        </button>
      </div>
    </div>
  );
};

export default AdblockDetector;
