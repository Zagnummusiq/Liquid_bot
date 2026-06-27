import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  reward: number;
  type: 'social' | 'daily' | 'ad';
  link?: string;
  isCompleted: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  // Get Telegram ID from WebApp SDK or fallback to mock
  const telegramId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345678;

  useEffect(() => {
    fetchData();
  }, []);

  // Watch for wallet connection to mark "Connect TON Wallet" task
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (tonConnectUI.connected && tonConnectUI.account?.address) {
        const walletTask = tasks.find(t => t.title === 'Connect TON Wallet' && !t.isCompleted);
        if (walletTask) {
          try {
            // 1. Save wallet address
            await fetch('/api/user/wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ telegramId, walletAddress: tonConnectUI.account.address })
            });

            // 2. Complete task
            const response = await fetch('/api/tasks/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ telegramId, taskId: walletTask._id })
            });

            if (response.ok) {
              const data = await response.json();
              setBalance(data.newBalance);
              setTasks(prev => prev.map(t => t._id === walletTask._id ? { ...t, isCompleted: true } : t));
            }
          } catch (error) {
            console.error('Wallet task completion failed:', error);
          }
        }
      }
    };

    if (tasks.length > 0) {
      handleWalletConnection();
    }
  }, [tonConnectUI.connected, tonConnectUI.account, tasks, telegramId]);

  const fetchData = async () => {
    try {
      const [tasksRes, profileRes] = await Promise.all([
        fetch(`/api/tasks/${telegramId}`),
        fetch(`/api/user/profile/${telegramId}`)
      ]);

      if (tasksRes.ok && profileRes.ok) {
        const tasksData = await tasksRes.json();
        const profileData = await profileRes.json();
        setTasks(tasksData);
        setBalance(profileData.balance);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (task: Task) => {
    if (task.isCompleted) return;

    // If it has a link, open it first
    if (task.link) {
      window.open(task.link, '_blank');
    }

    setClaimingId(task._id);
    
    // Simulate verification delay
    setTimeout(async () => {
      try {
        const response = await fetch('/api/tasks/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId, taskId: task._id })
        });

        if (response.ok) {
          const data = await response.json();
          setBalance(data.newBalance);
          setTasks(prev => prev.map(t => t._id === task._id ? { ...t, isCompleted: true } : t));
        }
      } catch (error) {
        console.error('Failed to claim reward:', error);
      } finally {
        setClaimingId(null);
      }
    }, 2000);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-botlife-accent">INITIALIZING_TASK_ENGINE...</div>;

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black mb-2">EARN_REWARDS</h1>
          <p className="text-gray-500 font-mono tracking-tighter uppercase">Complete neural tasks to unlock sync capacity</p>
        </div>
        <div className="bg-botlife-secondary p-6 rounded-2xl border border-botlife-accent/30 shadow-[0_0_20px_rgba(0,216,255,0.1)] flex items-center space-x-4">
            <div className="w-10 h-10 bg-botlife-accent rounded-full flex items-center justify-center text-botlife-primary font-black">B</div>
            <div>
                <div className="text-[10px] text-gray-500 uppercase font-mono">Neural Balance</div>
                <div className="text-3xl font-black text-botlife-accent">{balance.toLocaleString()} BP</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tasks.map((task) => (
          <motion.div 
            key={task._id}
            whileHover={{ scale: 1.01 }}
            className={`bg-botlife-secondary p-6 rounded-3xl border ${task.isCompleted ? 'border-green-500/20' : 'border-botlife-accent/10'} relative overflow-hidden group`}
          >
            {task.isCompleted && (
                <div className="absolute top-0 right-0 bg-green-500 text-botlife-primary text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                    COMPLETED
                </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="text-[10px] bg-botlife-accent/10 text-botlife-accent px-2 py-1 rounded font-mono uppercase">
                        {task.type}
                    </span>
                    <span className="text-botlife-accent font-bold">+{task.reward} BP</span>
                </div>
                <h3 className="text-2xl font-black mb-1">{task.title}</h3>
                <p className="text-gray-500 text-sm">{task.description}</p>
              </div>

              <button
                onClick={() => handleComplete(task)}
                disabled={task.isCompleted || claimingId === task._id}
                className={`w-full md:w-auto px-10 py-4 rounded-xl font-black transition-all ${
                  task.isCompleted 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                    : claimingId === task._id 
                    ? 'bg-botlife-accent/20 text-botlife-accent animate-pulse'
                    : 'bg-botlife-accent text-botlife-primary hover:scale-105 shadow-[0_0_15px_rgba(0,216,255,0.3)]'
                }`}
              >
                {task.isCompleted ? 'CLAIMED' : claimingId === task._id ? 'VERIFYING...' : 'START TASK'}
              </button>
            </div>

            {/* Futuristic Progress Bar for claiming */}
            {claimingId === task._id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-botlife-accent/10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-botlife-accent shadow-[0_0_10px_#00D8FF]"
                    />
                </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-8 bg-botlife-accent/5 rounded-3xl border border-botlife-accent/10 text-center">
          <h4 className="text-xl font-black mb-4 uppercase">Neural Tip</h4>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Tasks are updated every 24 hours. Maintain a high completion rate to increase your Neural Rank and unlock exclusive premium bots.</p>
      </div>
    </div>
  );
};

export default Tasks;
