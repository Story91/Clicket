'use client';

import { useState, useRef, useEffect } from 'react';

interface BackgroundMusicProps {
  autoPlay?: boolean;
}

export default function BackgroundMusic({ autoPlay = false }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Music tracks - using royalty-free music
  const tracks = [
    {
      name: "Club Music",
      url: "/music/musicclub.mp3", // Your uploaded music file
      genre: "Club"
    }
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;

    if (autoPlay && !isPlaying) {
      // Try to autoplay (might be blocked by browser)
      audio.play().catch(() => {
        console.log('Autoplay blocked by browser');
      });
    }

    const handleEnded = () => {
      // Only go to next track if we have multiple tracks
      if (tracks.length > 1) {
        nextTrack();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.log(`Could not load audio file: ${tracks[currentTrack].url}`);
      // Only try next track if we have multiple tracks
      if (tracks.length > 1) {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [volume, autoPlay, isPlaying, currentTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        console.log('Play blocked by browser');
      });
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
        title="Show music player"
      >
        🎵
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-gradient-to-br from-black/90 to-purple-900/80 backdrop-blur-md rounded-xl p-4 border border-purple-500/40 shadow-2xl shadow-purple-500/20 min-w-[180px]">
      <audio
        ref={audioRef}
        src={tracks[currentTrack].url}
        preload="metadata"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <span className="text-purple-400 text-sm">🎵</span>
          <span className="text-white text-sm font-semibold">Music</span>
        </div>
        <div className="flex items-center space-x-2">
          {isPlaying && (
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-purple-400 hover:text-white text-sm transition-colors"
            title="Hide music player"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center space-x-3 mb-3">
        {tracks.length > 1 && (
          <button
            onClick={prevTrack}
            className="text-purple-300 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Previous track"
          >
            ⏮️
          </button>
        )}
        
        <button
          onClick={togglePlay}
          className={`${isPlaying ? 'bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-purple-700'} hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        {tracks.length > 1 && (
          <button
            onClick={nextTrack}
            className="text-purple-300 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Next track"
          >
            ⏭️
          </button>
        )}
      </div>

      {/* Track Info */}
      <div className="text-center mb-3 border-t border-purple-500/30 pt-3">
        <div className="text-xs text-white font-medium truncate">
          {tracks[currentTrack].name}
        </div>
        <div className="text-xs text-purple-300 mt-1">
          {tracks[currentTrack].genre}
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-2 border-t border-purple-500/30 pt-3">
        <span className="text-xs text-purple-300">🔊</span>
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-purple-800/50 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, #4c1d95 ${volume * 100}%, #4c1d95 100%)`
            }}
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
        <span className="text-xs text-purple-300 min-w-[25px] text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Track Progress Indicator - only show if multiple tracks */}
      {tracks.length > 1 && (
        <div className="mt-2 text-center">
          <div className="text-xs text-purple-400">
            Track {currentTrack + 1} of {tracks.length}
          </div>
          <div className="flex justify-center space-x-1 mt-1">
            {tracks.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentTrack ? 'bg-purple-400' : 'bg-purple-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 