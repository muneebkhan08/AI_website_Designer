/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { ComputerDesktopIcon, GlobeAltIcon, PaintBrushIcon, RocketLaunchIcon, WindowIcon } from '@heroicons/react/24/outline';
import { CodeBracketSquareIcon, Squares2X2Icon } from '@heroicons/react/24/solid';

// Component that simulates drawing a wireframe then filling it with life
const DrawingTransformation = ({ 
  initialIcon: InitialIcon, 
  finalIcon: FinalIcon, 
  label,
  delay, 
  x, 
  y,
  rotation = 0
}: { 
  initialIcon: React.ElementType, 
  finalIcon: React.ElementType, 
  label: string,
  delay: number,
  x: string,
  y: string,
  rotation?: number
}) => {
  const [stage, setStage] = useState(0); // 0: Hidden, 1: Drawing, 2: Alive

  useEffect(() => {
    const cycle = () => {
      setStage(0);
      setTimeout(() => setStage(1), 500); // Start drawing
      setTimeout(() => setStage(2), 3500); // Come alive
    };

    // Initial delay
    const startTimeout = setTimeout(() => {
      cycle();
      // Repeat cycle
      const interval = setInterval(cycle, 9000);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  return (
    <div 
      className="absolute transition-all duration-1000 ease-in-out z-0 pointer-events-none"
      style={{ top: y, left: x, transform: `rotate(${rotation}deg)` }}
    >
      {/* Changed aspect ratio to be more like a desktop/browser window */}
      <div className={`relative w-40 h-28 md:w-52 md:h-36 rounded-lg backdrop-blur-md transition-all duration-1000 ${stage === 2 ? 'bg-zinc-800/40 border-zinc-500/50 shadow-2xl scale-110 -translate-y-4' : 'bg-zinc-900/10 border-zinc-800 scale-100 border border-dashed'}`}>
        
        {/* Label tag */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white border border-indigo-400 text-[8px] md:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-all duration-500 ${stage === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {label}
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col p-2">
          
          {/* Stage 1: Wireframe */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${stage === 1 ? 'opacity-100' : 'opacity-0'}`}>
             <InitialIcon className="w-8 h-8 md:w-12 md:h-12 text-zinc-600 stroke-1" />
             <div className="mt-2 w-20 h-1 bg-zinc-700/50 rounded"></div>
             <div className="mt-1 w-12 h-1 bg-zinc-700/50 rounded"></div>
          </div>

          {/* Stage 2: Alive/Web */}
          <div className={`absolute inset-0 transition-all duration-700 flex flex-col ${stage === 2 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}`}>
             {/* Mock Browser Header */}
             <div className="h-4 w-full border-b border-zinc-700/50 flex items-center px-2 space-x-1 bg-zinc-800/30 rounded-t-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
             </div>
             {/* Mock Web Content */}
             <div className="flex-1 p-2 flex gap-2">
                 {/* Sidebar / Image */}
                 <div className="w-1/3 h-full bg-zinc-700/30 rounded flex items-center justify-center">
                    <FinalIcon className="w-6 h-6 text-indigo-400" />
                 </div>
                 {/* Main Content */}
                 <div className="flex-1 flex flex-col space-y-2">
                    <div className="w-full h-2 bg-zinc-600/50 rounded"></div>
                    <div className="w-2/3 h-2 bg-zinc-600/50 rounded"></div>
                    <div className="flex gap-1 mt-auto">
                        <div className="w-1/2 h-6 bg-indigo-500/20 rounded"></div>
                        <div className="w-1/2 h-6 bg-zinc-700/30 rounded"></div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  return (
    <>
      {/* Background Transformation Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top Left: SaaS */}
        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={ComputerDesktopIcon} 
            finalIcon={RocketLaunchIcon} 
            label="SAAS PLATFORM"
            delay={0} 
            x="5%" 
            y="12%"
            rotation={-2} 
            />
        </div>

        {/* Bottom Right: Ecommerce */}
        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={GlobeAltIcon} 
            finalIcon={Squares2X2Icon} 
            label="E-COMMERCE"
            delay={3000} 
            x="80%" 
            y="65%"
            rotation={3} 
            />
        </div>

        {/* Top Right: Dashboard */}
        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={WindowIcon} 
            finalIcon={CodeBracketSquareIcon} 
            label="DASHBOARD"
            delay={5000} 
            x="82%" 
            y="15%"
            rotation={1} 
            />
        </div>

        {/* Bottom Left: Portfolio */}
        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={PaintBrushIcon} 
            finalIcon={ComputerDesktopIcon} 
            label="PORTFOLIO"
            delay={2000} 
            x="8%" 
            y="60%"
            rotation={-3} 
            />
        </div>
      </div>

      {/* Hero Text Content */}
      <div className="text-center relative z-10 max-w-4xl mx-auto px-4 pt-4 md:pt-12">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1]">
          AI Website <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Designer</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
          Generate professional, <span className="text-white font-medium">Responsive Web Design Systems</span> instantly. <br className="hidden sm:block" />
          Create Landing Pages, SaaS Dashboards, and Portfolios with clean code.
        </p>
      </div>
    </>
  );
};