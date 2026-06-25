import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Swipe gesture motion values
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [-150, 0, 150], [0.3, 1, 0.3]);
  const scale = useTransform(dragY, [-150, 0, 150], [0.9, 1, 0.9]);

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

        const vResponse = await fetch('https://botlife-app.onrender.com/api/neural-stream');
        let videoData: Video[] = [];
        if (vResponse.ok) {
          const data = await vResponse.json();
          videoData = data.map((v: any) => ({ ...v, type: 'video' }));
        }

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
    const nextCount = swipeCount + 1;
    setSwipeCount(nextCount);

    if (nextCount >= 3) {
      setSwipeCount(0);
      setIsAdBreak(true);
      try {
        await showAd('pop');
        setTimeout(() => {
          setIsAdBreak(false);
          setCurrentIndex((prev) => (prev + 1) % content.length);
          setIsPlaying(true);
        }, 2000);
      } catch (error) {
        setIsAdBreak(false);
        setCurrentIndex((prev) => (prev + 1) % content.length);
        setIsPlaying(true);
      }
    } else {
      setCurrentIndex((prev) => (prev + 1) % content.length);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + content.length) % content.length);
    setIsPlaying(true);
  };

  const onDragEnd = (_: any, info: any) => {
    if (isMinimized) return; // Disable swipe when minimized
    const threshold = 80;
    if (info.offset.y < -threshold) {
      handleNext();
    } else if (info.offset.y > threshold) {
      handlePrev();
    }
  };

  const handleVideoError = () => {
    console.warn('Media playback failed, skipping...');
    handleNext();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateProgress = () => setProgress((video.currentTime / video.duration) * 100);
      video.addEventListener('timeupdate', updateProgress);
      return () => video.removeEventListener('timeupdate', updateProgress);
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    const currentType = content[currentIndex]?.type;
    if ((currentType === 'image' || currentType === 'iframe') && !isAdBreak) {
      const duration = currentType === 'iframe' ? 45000 : 8000;
      const timer = setTimeout(handleNext, duration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, content, isAdBreak]);

  if (isLoading || content.length === 0) return null;

  const currentItem = content[currentIndex];

  return (
    <motion.div
      drag={isMinimized ? true : "y"}
      dragConstraints={isMinimized ? { left: 0, right: window.innerWidth - 150, top: 0, bottom: window.innerHeight - 100 } : { top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      style={{ y: isMinimized ? undefined : dragY, opacity, scale }}
      initial={{ x: window.innerWidth - 320, y: window.innerHeight - 520 }}
      className={`fixed z-50 bg-black rounded-2xl overflow-hidden border border-botlife-accent/30 shadow-[0_0_30px_rgba(0,216,255,0.3)] transition-all duration-300 ${isMinimized ? 'w-40 h-24' : 'w-72 h-[500px]'}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent z-30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
          <span className="text-[9px] font-black uppercase text-white/90 tracking-widest">Neural Engine</span>
        </div>
        <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/60 hover:text-white transition-colors">
          {isMinimized ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 12H6" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Engine Area */}
      <div className="relative w-full h-full group cursor-grab active:cursor-grabbing" onClick={togglePlay}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            {currentItem.type === 'video' ? (
              <video
                ref={videoRef}
                src={currentItem.url}
                autoPlay
                muted
                playsInline
                onEnded={handleNext}
                onError={handleVideoError}
                className={`w-full h-full object-cover ${isAdBreak ? 'blur-xl grayscale' : ''}`}
              />
            ) : currentItem.type === 'image' ? (
              <img src={currentItem.url} className={`w-full h-full object-cover ${isAdBreak ? 'blur-xl grayscale' : ''}`} alt="neural data" />
            ) : (
              <iframe 
                src={currentItem.url} 
                className={`w-full h-full pointer-events-none ${isAdBreak ? 'blur-xl grayscale' : ''}`}
                frameBorder="0"
                allow="autoplay; fullscreen"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Play/Pause Overlay */}
        {!isMinimized && !isPlaying && !isAdBreak && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
            <div className="bg-botlife-accent text-botlife-primary p-5 rounded-full shadow-[0_0_20px_#00D8FF]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Swipe Hint */}
        {!isMinimized && swipeCount === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 left-0 right-0 flex flex-col items-center z-20 pointer-events-none"
          >
            <div className="animate-bounce text-botlife-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Swipe Up for Next</span>
          </motion.div>
        )}

        {/* Ad Break Overlay */}
        <AnimatePresence>
          {isAdBreak && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-botlife-primary/80 z-40 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md"
            >
              <div className="w-12 h-12 border-4 border-botlife-accent border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#00D8FF]"></div>
              <div className="text-sm font-black text-botlife-accent uppercase tracking-[0.2em] mb-2">Neural Recalibration</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Optimizing Monetization Stream...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neural Progress Bar */}
        {!isMinimized && currentItem.type === 'video' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
            <motion.div 
              className="h-full bg-botlife-accent shadow-[0_0_10px_#00D8FF]" 
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        )}

        {/* Attribution & Swipe Stats */}
        {!isMinimized && (
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-20 pointer-events-none">
            <div className="flex flex-col">
              <span className="text-[7px] text-white/40 font-mono">NEURAL_ID: {currentItem.id.toString().substring(0,8)}</span>
              <span className="text-[9px] text-white font-black uppercase truncate max-w-[150px]">{currentItem.user}</span>
            </div>
            <div className="flex items-center space-x-1 opacity-50">
              <div className="text-[10px] text-botlife-accent font-mono">{currentIndex + 1}/{content.length}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NeuralStream;

