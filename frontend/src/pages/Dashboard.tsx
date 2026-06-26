import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Stats {
  totalSyncs: number;
  botCount: number;
  activeNodes: number;
  recentSyncs: Array<{ name: string; timestamp: string }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Live update every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-botlife-accent">ACCESSING_MAIN_FRAME...</div>;

  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black mb-2">NETWORK_DASHBOARD</h1>
          <p className="text-gray-500 font-mono tracking-tighter uppercase">Global Neural Synchronization Monitor</p>
        </div>
        <div className="bg-botlife-accent/10 border border-botlife-accent/20 px-4 py-2 rounded-lg">
          <span className="text-[10px] text-botlife-accent uppercase font-black animate-pulse">● Live Stream Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-botlife-secondary p-8 rounded-3xl border border-botlife-accent/10 shadow-xl">
          <div className="text-gray-500 text-xs uppercase mb-1 font-mono">Total Neural Syncs</div>
          <div className="text-5xl font-black text-white">{stats?.totalSyncs.toLocaleString()}</div>
          <div className="mt-4 h-1 w-full bg-botlife-accent/20 rounded-full overflow-hidden">
            <motion.div animate={{ width: "70%" }} className="h-full bg-botlife-accent" />
          </div>
        </div>
        <div className="bg-botlife-secondary p-8 rounded-3xl border border-botlife-accent/10 shadow-xl">
          <div className="text-gray-500 text-xs uppercase mb-1 font-mono">Active Nodes</div>
          <div className="text-5xl font-black text-white">{stats?.activeNodes}</div>
          <div className="mt-4 flex space-x-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`h-2 w-full rounded-sm ${i < 8 ? 'bg-green-500/50' : 'bg-gray-800'}`} />
            ))}
          </div>
        </div>
        <div className="bg-botlife-secondary p-8 rounded-3xl border border-botlife-accent/10 shadow-xl">
          <div className="text-gray-500 text-xs uppercase mb-1 font-mono">Bots Online</div>
          <div className="text-5xl font-black text-white">{stats?.botCount}</div>
          <div className="mt-4 text-botlife-accent text-[10px] font-mono uppercase font-black">All Systems Optimal</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-botlife-secondary p-8 rounded-3xl border border-botlife-accent/10">
          <h3 className="text-xl font-black mb-6 uppercase tracking-widest border-l-4 border-botlife-accent pl-4">Recent Synchronizations</h3>
          <div className="space-y-4">
            {stats?.recentSyncs.map((sync, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-botlife-primary/40 rounded-xl border border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-botlife-accent rounded-full shadow-[0_0_8px_#00D8FF]" />
                  <span className="font-bold text-white uppercase">{sync.name}</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{new Date(sync.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-botlife-secondary p-8 rounded-3xl border border-botlife-accent/10 flex flex-col justify-center text-center">
            <div className="mb-6">
                <svg className="w-16 h-16 text-botlife-accent mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-2xl font-black mb-2 uppercase">Neural Rank: ALPHA</h3>
                <p className="text-gray-500 font-mono text-xs px-10">You are currently synchronized with the global backbone. Maintain sync levels to unlock Level 2 Bots.</p>
            </div>
            <button className="bg-botlife-accent text-botlife-primary font-black py-4 rounded-xl hover:scale-105 transition-all uppercase tracking-widest text-sm">
                Increase Sync Capacity
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
