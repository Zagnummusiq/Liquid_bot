import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  prizePool: string;
  endDate: string;
}

interface LeaderboardUser {
  username: string;
  balance: number;
  walletAddress: string | null;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, leaderboardRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/leaderboard')
        ]);

        if (campaignsRes.ok && leaderboardRes.ok) {
          const campaignsData = await campaignsRes.json();
          const leaderboardData = await leaderboardRes.json();
          setCampaigns(campaignsData);
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error('Failed to load campaigns/leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-botlife-accent">SYNCING_GLOBAL_LADDER...</div>;

  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-black mb-4">GLOBAL_CAMPAIGNS</h1>
        <p className="text-gray-500 font-mono uppercase tracking-widest">Compete. Rank. Win. Neural nodes across the world are active.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl font-black mb-8 border-l-4 border-botlife-accent pl-4 uppercase">Active Campaigns</h2>
          {campaigns.map((campaign) => (
            <motion.div 
              key={campaign._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-botlife-secondary p-8 rounded-3xl border border-botlife-accent/20 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 bg-botlife-accent text-botlife-primary font-black px-6 py-2 rounded-bl-2xl uppercase tracking-widest text-xs">
                Active
              </div>
              <div className="mb-6">
                <h3 className="text-4xl font-black mb-4">{campaign.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{campaign.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-6 p-6 bg-botlife-primary/50 rounded-2xl border border-white/5">
                <div>
                  <div className="text-gray-500 text-[10px] uppercase font-mono mb-1">Total Prize Pool</div>
                  <div className="text-3xl font-black text-botlife-accent">{campaign.prizePool}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase font-mono mb-1">Time Remaining</div>
                  <div className="text-3xl font-black text-white">
                    {Math.max(0, Math.floor((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} DAYS
                  </div>
                </div>
              </div>
              <button className="w-full mt-8 bg-botlife-accent text-botlife-primary font-black py-4 rounded-xl hover:scale-[1.02] transition-transform uppercase tracking-widest">
                Join Neural Competition
              </button>
            </motion.div>
          ))}
        </div>

        <div className="bg-botlife-secondary p-8 rounded-3xl border border-botlife-accent/10 h-fit">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-widest border-l-4 border-botlife-accent pl-4">Leaderboard</h2>
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-4 rounded-xl border ${index === 0 ? 'bg-botlife-accent/10 border-botlife-accent/30 shadow-[0_0_15px_rgba(0,216,255,0.1)]' : 'bg-botlife-primary/40 border-white/5'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${index === 0 ? 'bg-botlife-accent text-botlife-primary' : 'bg-white/10 text-gray-400'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm uppercase">{user.username}</div>
                    {user.walletAddress && <div className="text-[8px] font-mono text-botlife-accent">{user.walletAddress}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-botlife-accent">{user.balance.toLocaleString()}</div>
                  <div className="text-[8px] text-gray-500 uppercase font-mono">BP</div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <div className="text-center py-10 text-gray-500 font-mono text-xs uppercase">No neural activity detected</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
