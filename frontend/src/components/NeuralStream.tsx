import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showAd, triggerAutoMonetization } from '../services/monetag';

interface Video {
  id: number;
  url: string;
  image: string;
  user: string;
}

const NeuralStream: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isAdBreak, setIsAdBreak] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://botlife-app.onrender.com/api/neural-stream');
        if (response.ok) {
          const data = await response.json();
          setVideos(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load neural stream:', error);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoEnd = async () => {
    setIsAdBreak(true);
    // Show Interstitial Ad during the break
    try {
      await showAd('pop'); // Using pop as a light break
      setTimeout(() => {
        setIsAdBreak(false);
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      }, 2000);
    } catch (error) {
      setIsAdBreak(false);
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }
  };

  const handleManualSkip = () => {
    triggerAutoMonetization();
    handleVideoEnd();
  };

  if (isLoading || videos.length === 0) return null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: window.innerWidth - (isMinimized ? 150 : 300), top: 0, bottom: window.innerHeight - (isMinimized ? 100 : 500) }}
      initial={{ x: window.innerWidth - 320, y: window.innerHeight - 520 }}
      className={`fixed z-50 bg-black rounded-2xl overflow-hidden border border-botlife-accent/30 shadow-[0_0_20px_rgba(0,216,255,0.2)] ${isMinimized ? 'w-40 h-24' : 'w-72 h-[450px]'}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[8px] font-mono uppercase text-white/70">Neural Stream</span>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/50 hover:text-white">
            {isMinimized ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="relative w-full h-full group">
        <video
          ref={videoRef}
          src={videos[currentIndex].url}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className={`w-full h-full object-cover ${isAdBreak ? 'blur-md grayscale' : ''}`}
        />

        {/* Ad Break Overlay */}
        <AnimatePresence>
          {isAdBreak && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-botlife-primary/60 flex flex-col items-center justify-center text-center p-4"
            >
              <div className="w-8 h-8 border-2 border-botlife-accent border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-[10px] font-black text-botlife-accent uppercase tracking-widest">Neural Calibration</div>
              <div className="text-[8px] text-gray-400 mt-1 uppercase">Synchronizing Stream Data...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Controls */}
        {!isMinimized && !isAdBreak && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <button 
              onClick={handleManualSkip}
              className="bg-botlife-accent/20 hover:bg-botlife-accent/40 text-botlife-accent p-3 rounded-full backdrop-blur-sm border border-botlife-accent/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Attribution */}
        {!isMinimized && (
          <div className="absolute bottom-2 left-2 right-2 text-[8px] text-white/30 font-mono truncate">
            NEURAL_SOURCE: {videos[currentIndex].user.toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NeuralStream;
