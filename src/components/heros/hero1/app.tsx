"use client"
import BattleButton from '@/components/filters/ctas/material-button/battle-button'; 
import { SteamIcon } from '@/components/icons';
import { GameIconsArrowScope } from '@/components/logo/icons/arrow-scope';
import { GameIconsSupersonicBullet } from '@/components/logo/icons/supersonic-bullet';
import { logo } from '@/components/primitives';
import { Chip, Kbd, Spacer } from '@nextui-org/react';
import React, { useState, useEffect, useRef } from 'react';

const HeroBanner: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  const videos = [
    '/cs2/test-imgbanner.png'
  ];

  useEffect(() => {
    // videoRefs.current[currentVideoIndex].play();

    const handleEnded = () => {
      setCurrentVideoIndex((currentVideoIndex + 1) % videos.length);
    };

    videoRefs.current[currentVideoIndex].addEventListener('ended', handleEnded);

    return () => {
      videoRefs.current[currentVideoIndex].removeEventListener('ended', handleEnded);
    };
  }, [currentVideoIndex]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoHeight, setVideoHeight] = useState('auto');

  const handlePlayClick = () => {
    const videoElement = videoRefs.current[currentVideoIndex];
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

//   useEffect(() => {
//     const updateVideoHeight = () => {
//       const videoElement = videoRefs.current[currentVideoIndex];
//       const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
//       const containerWidth = videoElement.parentElement?.offsetWidth;
//       if (containerWidth) {
//         const calculatedHeight = containerWidth / aspectRatio;
//         setVideoHeight(Math.min(720, calculatedHeight) + 'px'); // Cap height at 720px
//       }
//     };

//     updateVideoHeight();
//     window.addEventListener('resize', updateVideoHeight);
//     return () => window.removeEventListener('resize', updateVideoHeight);
//   }, [currentVideoIndex]);

  return (
    <div className="hero-banner" style={{ width: "100%" }}>
      {videos.map((videoSrc, index) => (
        <div key={index} style={{ display: index === currentVideoIndex ? 'block' : 'none' }}>
          <video
            ref={el => videoRefs.current[index] = el!}
            src={videoSrc}
            muted={!isPlaying}
            loop={index === currentVideoIndex}
            style={{ width: '3000px', height: "720px", objectFit: 'cover'}} 
          /> 
        </div>
      ))}
      {/* Content Overlays */}
      <div className="hero-content">
        <h1 className="hero-title">The <b>Arena</b> Awaits.</h1>
        <div className="hero-subtitle">
        Embrace the pinnacle of competitive gaming
        <p className="hero-description">Get to know what means to <span className={logo({color: "battleOrange"})}>clutch</span> in the international stage.</p>
        <Spacer y={4} />
        <div className="flex align-items justify-center items-center">
        <BattleButton onClick={handlePlayClick}>
                Register Team
            </BattleButton>
            <Spacer x={4} />
            <BattleButton  onClick={handlePlayClick}> 
                Battle Now <Kbd>w</Kbd>
            </BattleButton>
            {/* <Spacer x={4} />
            <BattleButton onClick={handlePlayClick} style={
            {
              border: "1px solid transparent",
              color: "#F2F2F2",
              boxShadow: '1px 1px 1px #34445C'
            }
            }>
                Go To Match-Making
            </BattleButton> */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
