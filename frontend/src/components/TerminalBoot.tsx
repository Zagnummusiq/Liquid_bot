import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TerminalBoot: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  const bootSequence = [
    "> INITIALIZING NEURAL_KERNEL v4.2.0...",
    "> CONNECTING TO BOTLIFE_NODE_78...",
    "> SYNCING WITH RENDER_BACKEND...",
    "> FETCHING MONETAG_AD_STACK...",
    "> LOADING PEXELS_VIDEO_ENGINE...",
    "> NEURAL_BLOCK_CHECK: PASS",
    "> ESTABLISHING ENCRYPTED LINK...",
    "> STATUS: ALL SYSTEMS ONLINE"
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setLogs(prev => [...prev, bootSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onComplete, 500);
        }, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center font-mono p-6"
        >
          <div className="max-w-xl w-full">
            <div className="flex space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-2">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-botlife-accent"
                >
                  <span className="text-white opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex items-center space-x-4">
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: bootSequence.length * 0.4 }}
                  className="bg-botlife-accent h-full shadow-[0_0_10px_#00D8FF]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TerminalBoot;
