import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showAd, triggerAutoMonetization } from '../services/monetag';

interface Video {
  id: number | string;
  url: string;
  image: string;
  user: string;
  type?: 'video' | 'image' | 'iframe';
}

const NeuralStream: React.FC = () => {
  const [content, setContent] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isAdBreak, setIsAdBreak] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const featured: Video[] = [
          {
            id: 'featured-1',
            url: 'https://embed.api.video/vod/vi38w7fofrSwR3NSzoq5zIXh',
            image: '',
            user: 'NEURAL_HD_SOURCE',
            type: 'iframe'
          },
          {
            id: 'featured-2',
            url: 'https://embed.api.video/vod/vi3B05Q7lHGVBRsRBj59GxBY',
            image: '',
            user: 'NEURAL_HD_SOURCE',
            type: 'iframe'
          }
        ];

        // Try fetching videos first
        const vResponse = await fetch('https://botlife-app.onrender.com/api/neural-stream');
        let videoData: Video[] = [];
        if (vResponse.ok) {
          const data = await vResponse.json();
          videoData = data.map((v: any) => ({ ...v, type: 'video' }));
        }

        // Fetch images from Unsplash
        const iResponse = await fetch('https://botlife-app.onrender.com/api/neural-images');
        let imageData: Video[] = [];
        if (iResponse.ok) {
          const data = await iResponse.json();
          imageData = data.map((i: any) => ({ 
            id: i.id, 
            url: i.url, 
            image: i.url, 
            user: i.user, 
            type: 'image' 
          }));
        }

        // Shuffle content but keep featured at the start occasionally
        const combined = [...videoData, ...imageData].sort(() => Math.random() - 0.5);
        setContent([...featured, ...combined]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load neural stream content:', error);
      }
    };

    fetchContent();
  }, []);

  const handleNext = async () => {
    setIsAdBreak(true);
    try {
      await showAd('pop');
      setTimeout(() => {
        setIsAdBreak(false);
        setCurrentIndex((prev) => (prev + 1) % content.length);
      }, 2000);
    } catch (error) {
      setIsAdBreak(false);
      setCurrentIndex((prev) => (prev + 1) % content.length);
    }
  };

  const handleVideoError = () => {
    console.warn('Media playback failed, skipping to next content...');
    handleNext();
  };

  useEffect(() => {
    const currentType = content[currentIndex]?.type;
    if ((currentType === 'image' || currentType === 'iframe') && !isAdBreak) {
      const duration = currentType === 'iframe' ? 30000 : 8000; // 30s for featured videos, 8s for images
      const timer = setTimeout(handleNext, duration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, content, isAdBreak]);

  const handleManualSkip = () => {
    triggerAutoMonetization();
    handleNext();
  };

  if (isLoading || content.length === 0) return null;

  const currentItem = content[currentIndex];

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

      {/* Content Rendering */}
      <div className="relative w-full h-full group">
        {currentItem.type === 'video' ? (
          <video
            ref={videoRef}
            src={currentItem.url}
            autoPlay
            muted
            playsInline
            onEnded={handleNext}
            onError={handleVideoError}
            className={`w-full h-full object-cover transition-all duration-1000 ${isAdBreak ? 'blur-md grayscale scale-110' : ''}`}
          />
        ) : currentItem.type === 'image' ? (
          <div className="w-full h-full overflow-hidden">
            <motion.img
              initial={{ scale: 1.2 }}
              animate={{ scale: isAdBreak ? 1.3 : 1 }}
              transition={{ duration: 8, ease: "linear" }}
              src={currentItem.url}
              className={`w-full h-full object-cover transition-all duration-1000 ${isAdBreak ? 'blur-md grayscale' : ''}`}
            />
          </div>
        ) : (
          <iframe 
            src={currentItem.url} 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            allowFullScreen={true}
            className={`w-full h-full transition-all duration-1000 ${isAdBreak ? 'blur-md grayscale scale-110 pointer-events-none' : ''}`}
          />
        )}

        {/* Ad Break Overlay */}
        <AnimatePresence>
          {isAdBreak && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-botlife-primary/60 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm"
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
            {currentItem.type.toUpperCase()}_SOURCE: {currentItem.user.toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NeuralStream;
