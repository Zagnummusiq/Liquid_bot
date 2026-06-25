import React, { useEffect } from 'react';
import { showAd, triggerAutoMonetization } from './services/monetag';

interface BotCardProps {
  name: string;
  description: string;
  category: string;
  url?: string;
}

const BotCard: React.FC<BotCardProps> = ({ name, description, category, url }) => {
  const [status, setStatus] = React.useState<'idle' | 'syncing' | 'verified'>('idle');

  const handleAction = async () => {
    setStatus('syncing');
    triggerAutoMonetization();
    
    // Show rewarded ad
    try {
      await showAd('rewarded');
      setStatus('verified');
      
      setTimeout(() => {
        if (url) {
          window.open(url, '_blank');
        } else {
          alert(`${name} installation started! Check your home screen.`);
        }
        setStatus('idle');
      }, 1000);
    } catch (error) {
      console.error('Monetization failed:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="bg-botlife-secondary p-6 rounded-xl border border-botlife-accent/20 hover:border-botlife-accent transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-botlife-accent font-mono uppercase tracking-widest">{category}</div>
        {status !== 'idle' && (
          <div className="text-[10px] bg-botlife-accent/10 text-botlife-accent px-2 py-1 rounded animate-pulse">
            {status === 'syncing' ? 'NEURAL SYNC...' : 'VERIFIED'}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-3">{name}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      <button 
        onClick={handleAction}
        disabled={status !== 'idle'}
        className="w-full bg-botlife-accent text-botlife-primary font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {status === 'idle' ? 'Get Bot' : 'Processing...'}
      </button>
    </div>
  );
};

function App() {
  const [systemStatus, setSystemStatus] = React.useState<'Online' | 'Connecting'>('Connecting');

  useEffect(() => {
    // Show in-app interstitial on load
    showAd('inApp');
    
    // Mock system check
    setTimeout(() => setSystemStatus('Online'), 2000);
  }, []);

  const bots = [
    {
      name: "Liquid Luck",
      description: "Smart neural engineering for liquid monetization. Integrated with MoneySlash.",
      category: "Neural Engineering",
      url: "https://t.me/Liquidluck_bot/moneyslash"
    },
    {
      name: "Display Bot Alpha",
      description: "High-frequency ad display bot for maximum impressions and smart routing.",
      category: "Display Bots"
    },
    {
      name: "AdGuard Pro",
      description: "Advanced display ad optimization and verification system.",
      category: "Display Ads"
    },
    {
      name: "Neural Nexus",
      description: "Core brain for neural engineering systems and bot orchestration.",
      category: "Neural Engineering"
    }
  ];

  return (
    <div className="min-h-screen bg-botlife-primary text-botlife-text font-sans">
      {/* Header */}
      <nav className="p-6 border-b border-botlife-secondary flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-black tracking-tighter text-botlife-accent">BOTLIFE</div>
          <div className="hidden sm:flex items-center space-x-2 bg-botlife-secondary px-3 py-1 rounded-full border border-botlife-accent/10">
            <div className={`w-2 h-2 rounded-full ${systemStatus === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">System {systemStatus}</span>
          </div>
        </div>
        <div className="space-x-6 hidden md:flex">
          <a href="#" className="hover:text-botlife-accent">Store</a>
          <a href="#" className="hover:text-botlife-accent">My Bots</a>
          <a href="#" className="hover:text-botlife-accent">Dashboard</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-botlife-primary to-botlife-secondary">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          THE FUTURE OF <br />
          <span className="text-botlife-accent">BOT MONETIZATION</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Source every useful tool for neural engineering systems, display bots, and display ads in one standalone platform.
        </p>
        <button 
          onClick={() => showAd('pop')}
          className="bg-botlife-accent text-botlife-primary px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform"
        >
          INSTALL BOTLIFE
        </button>
      </section>

      {/* Bot Catalog */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 border-l-4 border-botlife-accent pl-4">BOT CATALOG</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bots.map((bot, index) => (
            <BotCard key={index} {...bot} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="p-12 border-t border-botlife-secondary text-center text-gray-500">
        <div className="text-botlife-accent font-bold mb-4">BOTLIFE © 2026</div>
        <p className="text-sm">Powered by Monetag & Neural Engineering Systems</p>
      </footer>
    </div>
  );
}

export default App;
