import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { triggerAutoMonetization } from '../services/monetag';

const RoamingAd: React.FC = () => {
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Slowly "roam" the ad around a small area to attract the eye
    const interval = setInterval(() => {
      setPosition(prev => ({
        x: Math.max(10, Math.min(90, prev.x + (Math.random() * 10 - 5))),
        y: Math.max(10, Math.min(90, prev.y + (Math.random() * 10 - 5)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const handleClick = () => {
    triggerAutoMonetization();
    // Occasionally "bounce" the user to a direct link when they try to close it
    if (Math.random() > 0.7) {
        setIsVisible(false);
    }
  };

  return (
    <motion.div
      animate={{ left: `${position.x}%`, top: `${position.y}%` }}
      transition={{ duration: 3, ease: "linear" }}
      className="fixed z-40 cursor-pointer pointer-events-auto shadow-2xl"
      onClick={handleClick}
    >
      <div className="bg-botlife-accent text-botlife-primary p-3 rounded-lg flex items-center space-x-2 border-2 border-white/20 animate-bounce">
        <div className="w-2 h-2 bg-botlife-primary rounded-full animate-ping"></div>
        <span className="text-[10px] font-black uppercase tracking-tighter">New Tool Ready</span>
        <button 
            onClick={(e) => {
                e.stopPropagation();
                triggerAutoMonetization();
                setIsVisible(false);
            }}
            className="ml-2 hover:scale-110 transition-transform"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default RoamingAd;
