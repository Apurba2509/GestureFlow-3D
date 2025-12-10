import React, { useState } from 'react';
import { ShapeType } from '../types';
import { THEME_COLORS, SHAPE_LABELS } from '../constants';
import { Maximize2, Hand, Move, ChevronRight, Activity, Camera } from 'lucide-react';

interface ControlsProps {
  currentShape: ShapeType;
  onShapeChange: (s: ShapeType) => void;
  currentColor: string;
  onColorChange: (c: string) => void;
  isCameraReady: boolean;
  handDetected: boolean;
  showOnboarding: boolean;
  onDismissOnboarding: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  currentShape,
  onShapeChange,
  currentColor,
  onColorChange,
  isCameraReady,
  handDetected,
  showOnboarding,
  onDismissOnboarding
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 overflow-hidden">
      
      {/* Background Gradient for UI Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

      {/* --- Header Bar --- */}
      <div className="flex justify-between items-center w-full z-10 pointer-events-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-2xl md:text-3xl font-light tracking-[0.2em] uppercase mix-blend-difference opacity-90">
            Aether
          </h1>
          <div className="h-px w-12 bg-white/20 hidden md:block"></div>
          <span className="text-xs text-white/40 tracking-widest hidden md:block">INTERACTIVE PARTICLE SYSTEM</span>
        </div>

        {/* Status Pill */}
        <div className={`
            flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md transition-all duration-700
            ${handDetected 
              ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
              : 'bg-black/20 border-white/5'}
        `}>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isCameraReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                 {isCameraReady ? (handDetected ? 'Signal Active' : 'Standby') : 'System Init'}
               </span>
            </div>
            {handDetected && <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />}
        </div>
      </div>


      {/* --- Onboarding Overlay --- */}
      {showOnboarding && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-500 pointer-events-auto">
            <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-4 transform transition-all">
                <div className="text-center mb-8">
                   <h2 className="text-3xl font-light text-white tracking-widest mb-2">WELCOME</h2>
                   <p className="text-white/40 text-sm tracking-wide">Gesture Control System</p>
                </div>

                <div className="space-y-6 mb-10">
                   <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                         <Move className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-white text-sm font-semibold tracking-wide">INTERACT</h3>
                         <p className="text-white/40 text-xs mt-1">Move your hand to repel particles and create ripples.</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                         <Maximize2 className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-white text-sm font-semibold tracking-wide">EXPAND</h3>
                         <p className="text-white/40 text-xs mt-1">Move two hands apart to zoom in and expand the universe.</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400">
                         <Hand className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-white text-sm font-semibold tracking-wide">FOCUS</h3>
                         <p className="text-white/40 text-xs mt-1">Clench your fist to condense energy and pull particles together.</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={onDismissOnboarding}
                  className="group w-full py-4 bg-white text-black font-bold tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  INITIALIZE EXPERIENCE
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
         </div>
      )}


      {/* --- Floating Bottom Dock --- */}
      <div className={`flex flex-col items-center gap-6 w-full z-10 transition-opacity duration-700 delay-300 pointer-events-auto ${showOnboarding ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
        
        {/* Floating Glass Bar */}
        <div className="flex flex-col md:flex-row items-center gap-2 p-2 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
           
           {/* Shape Toggles */}
           <div className="flex gap-1 p-1">
             {Object.values(ShapeType).map((shape) => (
               <button
                 key={shape}
                 onClick={() => onShapeChange(shape)}
                 className={`
                   px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300
                   ${currentShape === shape 
                     ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                     : 'text-white/40 hover:text-white hover:bg-white/5'}
                 `}
               >
                 {SHAPE_LABELS[shape]}
               </button>
             ))}
           </div>

           <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
           <div className="h-px w-full bg-white/10 my-1 md:hidden"></div>

           {/* Color Swatches */}
           <div className="flex gap-2 px-2">
             {THEME_COLORS.map((theme) => (
               <button
                 key={theme.name}
                 onClick={() => onColorChange(theme.hex)}
                 className={`
                   relative w-6 h-6 rounded-full transition-all duration-500 group
                 `}
                 title={theme.name}
               >
                  <span className={`absolute inset-0 rounded-full transition-transform duration-300 ${currentColor === theme.hex ? 'scale-100' : 'scale-75 group-hover:scale-90'}`} style={{ backgroundColor: theme.hex }}></span>
                  {currentColor === theme.hex && (
                    <span className="absolute -inset-1 rounded-full border border-white/30 animate-pulse"></span>
                  )}
               </button>
             ))}
           </div>

        </div>

        {/* Footer Hint */}
        {!showOnboarding && !handDetected && (
          <div className="text-white/30 text-[10px] tracking-widest uppercase animate-pulse mb-2">
             Waiting for gesture input...
          </div>
        )}
      </div>

    </div>
  );
};