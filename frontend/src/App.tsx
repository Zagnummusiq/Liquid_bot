import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { showAd, triggerAutoMonetization } from './services/monetag';
import AdblockDetector from './components/AdblockDetector';
import RoamingAd from './components/RoamingAd';
import NeuralStream from './components/NeuralStream';

interface Bot {
  id: number;
  name: string;
  description: string;
  category: string;
  url?: string;
  telegram_handle: string;
  price: number;
}

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const BotCard: React.FC<Bot> = ({ id, name, description, category, url, telegram_handle }) => {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'verified' | 'handoff'>('idle');

  const handleAction = async () => {
    setStatus('syncing');
    await triggerAutoMonetization();
    
    try {
      await showAd('rewarded');
      setStatus('verified');
      
      // Generate sync token for Telegram
      const response = await fetch('https://botlife-app.onrender.com/api/generate-sync-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: id })
      });
      
      const { token } = await response.json();
      setStatus('handoff');

      setTimeout(() => {
        const tgLink = `https://t.me/${telegram_handle}?start=sync_${token}`;
        window.open(tgLink, '_blank');
        setStatus('idle');
      }, 1500);
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
            {status === 'syncing' ? 'NEURAL SYNC...' : status === 'verified' ? 'VERIFIED' : 'HANDOFF TO TG...'}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-3">{name}</h3>
      <p className="text-gray-400 mb-6 line-clamp-2">{description}</p>
      <div className="flex space-x-3">
        <button 
          onClick={handleAction}
          disabled={status !== 'idle'}
          className="flex-1 bg-botlife-accent text-botlife-primary font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {status === 'idle' ? 'Get Bot' : 'Processing...'}
        </button>
        <Link 
          to={`/bot/${id}`}
          className="bg-botlife-secondary border border-botlife-accent/30 text-botlife-accent px-4 py-3 rounded-lg hover:bg-botlife-accent/10 transition-colors"
        >
          Details
        </Link>
      </div>
    </div>
  );
};

const Store = ({ bots }: { bots: Bot[] }) => (
  <PageTransition>
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

    <section className="py-20 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-12 border-l-4 border-botlife-accent pl-4">BOT CATALOG</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bots.map((bot) => (
          <BotCard key={bot.id} {...bot} />
        ))}
      </div>
    </section>
  </PageTransition>
);

const BotDetails = ({ bots }: { bots: Bot[] }) => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<'idle' | 'syncing' | 'verified' | 'handoff'>('idle');
  const bot = bots.find(b => b.id === Number(id));

  if (!bot) return <div className="p-20 text-center">Bot not found in neural network.</div>;

  const handleSync = async () => {
    setStatus('syncing');
    await triggerAutoMonetization();
    
    try {
      await showAd('rewarded');
      setStatus('verified');
      
      const response = await fetch('https://botlife-app.onrender.com/api/generate-sync-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: bot.id })
      });
      
      const { token } = await response.json();
      setStatus('handoff');

      setTimeout(() => {
        const tgLink = `https://t.me/${bot.telegram_handle}?start=sync_${token}`;
        window.open(tgLink, '_blank');
        setStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Monetization failed:', error);
      setStatus('idle');
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-20 px-6">
        <Link to="/" className="text-botlife-accent mb-8 inline-block hover:underline">← Back to Store</Link>
        <div className="bg-botlife-secondary p-10 rounded-3xl border border-botlife-accent/20">
          <div className="text-botlife-accent font-mono mb-4 uppercase tracking-[0.3em]">{bot.category}</div>
          <h1 className="text-6xl font-black mb-6">{bot.name}</h1>
          <p className="text-2xl text-gray-400 mb-10 leading-relaxed">{bot.description}</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-botlife-primary p-6 rounded-2xl border border-botlife-accent/10">
              <div className="text-gray-500 text-sm uppercase mb-1">Price</div>
              <div className="text-2xl font-bold text-botlife-accent">FREE / AD-SUPPORTED</div>
            </div>
            <div className="bg-botlife-primary p-6 rounded-2xl border border-botlife-accent/10">
              <div className="text-gray-500 text-sm uppercase mb-1">Status</div>
              <div className="text-2xl font-bold text-green-500">READY FOR SYNC</div>
            </div>
          </div>

          <button 
            onClick={handleSync}
            disabled={status !== 'idle'}
            className="w-full bg-botlife-accent text-botlife-primary font-black py-5 rounded-2xl text-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {status === 'idle' ? 'START NEURAL SYNC' : status === 'syncing' ? 'SYNCING...' : status === 'verified' ? 'VERIFIED' : 'HANDING OFF...'}
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

function App() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [systemStatus, setSystemStatus] = useState<'Online' | 'Connecting'>('Connecting');

  useEffect(() => {
    showAd('inApp');
    
    const fetchData = async () => {
      try {
        const response = await fetch('https://botlife-app.onrender.com/api/bots');
        if (response.ok) {
          const data = await response.json();
          setBots(data);
          setSystemStatus('Online');
        }
      } catch (error) {
        console.error('Failed to connect to neural network:', error);
        // Fallback for UI if backend is down
        setSystemStatus('Connecting');
      }
    };

    fetchData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-botlife-primary text-botlife-text font-sans selection:bg-botlife-accent selection:text-botlife-primary">
        <AdblockDetector />
        <RoamingAd />
        <NeuralStream />
        
        {/* Header */}
        <nav className="p-6 border-b border-botlife-secondary flex justify-between items-center sticky top-0 bg-botlife-primary/80 backdrop-blur-lg z-50">
          <Link to="/" className="flex items-center space-x-4">
            <div className="text-3xl font-black tracking-tighter text-botlife-accent">BOTLIFE</div>
            <div className="hidden sm:flex items-center space-x-2 bg-botlife-secondary px-3 py-1 rounded-full border border-botlife-accent/10">
              <div className={`w-2 h-2 rounded-full ${systemStatus === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">System {systemStatus}</span>
            </div>
          </Link>
          <div className="space-x-6 hidden md:flex font-bold">
            <Link to="/" className="hover:text-botlife-accent transition-colors">Store</Link>
            <a href="#" className="hover:text-botlife-accent transition-colors">Dashboard</a>
          </div>
        </nav>

        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Store bots={bots} />} />
              <Route path="/bot/:id" element={<BotDetails bots={bots} />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="p-12 border-t border-botlife-secondary text-center text-gray-500">
          <div className="text-botlife-accent font-bold mb-4">BOTLIFE © 2026</div>
          <p className="text-sm">Powered by Monetag & Neural Engineering Systems</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
