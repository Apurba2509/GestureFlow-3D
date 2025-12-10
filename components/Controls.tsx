import React, { useState } from 'react';
import { ShapeType } from '../types';
import { THEME_COLORS, SHAPE_LABELS } from '../constants';
import { Maximize, Sparkles, ChevronRight, Activity, Zap, Scan, Camera } from 'lucide-react';

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


      {/* --- Onboarding Overlay (Redesigned) --- */}
      {showOnboarding && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500 pointer-events-auto">
            {/* Glass Card */}
            <div className="relative overflow-hidden bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 p-0 rounded-2xl max-w-md w-full shadow-2xl transform transition-all mx-4">
                
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>

                <div className="p-8">
                  <div className="mb-8 text-center">
                     <h2 className="text-2xl font-light text-white tracking-[0.15em] mb-2 uppercase">Gesture Controls</h2>
                     <p className="text-white/40 text-xs tracking-wide">MASTER THE ELEMENTS</p>
                  </div>

                  <div className="space-y-4">
                     {/* Instruction 1 */}
                     <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="mt-1 p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg text-cyan-400 shadow-lg shadow-cyan-900/20">
                           <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-1">Disrupt</h3>
                           <p className="text-white/60 text-sm font-light leading-relaxed">
                             Wave a hand through the field to create <span className="text-cyan-200">turbulence</span> and repel particles.
                           </p>
                        </div>
                     </div>

                     {/* Instruction 2 */}
                     <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="mt-1 p-2 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg text-purple-400 shadow-lg shadow-purple-900/20">
                           <Scan className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-1">Scale</h3>
                           <p className="text-white/60 text-sm font-light leading-relaxed">
                             Move two hands apart to <span className="text-purple-200">expand</span> the universe and zoom in.
                           </p>
                        </div>
                     </div>

                     {/* Instruction 3 */}
                     <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="mt-1 p-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg text-rose-400 shadow-lg shadow-rose-900/20">
                           <Zap className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-1">Intensify</h3>
                           <p className="text-white/60 text-sm font-light leading-relaxed">
                             Clench your fist to condense <span className="text-rose-200">energy</span> and pull particles inward.
                           </p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Footer Button */}
                <div className="p-4 bg-white/5 border-t border-white/5">
                  <button 
                    onClick={onDismissOnboarding}
                    className="w-full py-4 bg-white text-black font-bold tracking-[0.2em] text-xs rounded-xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    INITIALIZE
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
            </div>
         </div>
      )}


      {/* --- Floating Bottom Dock --- */}
      <div className={`flex flex-col items-center gap-6 w-full z-10 transition-all duration-700 delay-300 pointer-events-auto ${showOnboarding ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
        
        {/* Floating Glass Bar */}
        <div className="flex flex-col md:flex-row items-center gap-2 p-2 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
           
           {/* Shape Toggles */}
           <div className="flex gap-1 p-1">
             {Object.values(ShapeType).map((shape) => (
               <button
                 key={shape}
                 onClick={() => onShapeChange(shape)}
                 className={`
                   px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
                   ${currentShape === shape 
                     ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                     : 'bg-transparent text-white/50 border-transparent hover:bg-white/5 hover:text-white'}
                 `}
               >
                 {SHAPE_LABELS[shape]}
               </button>
             ))}
           </div>

           <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
           <div className="h-px w-full bg-white/10 my-1 md:hidden"></div>

           {/* Color Swatches */}
           <div className="flex gap-2 px-2 items-center">
             {THEME_COLORS.map((theme) => (
               <button
                 key={theme.name}
                 onClick={() => onColorChange(theme.hex)}
                 className={`
                   relative w-6 h-6 rounded-full transition-all duration-300 group
                 `}
                 title={theme.name}
               >
                  <span 
                    className={`absolute inset-0 rounded-full border border-white/10 transition-transform duration-300 ${currentColor === theme.hex ? 'scale-110' : 'scale-90 opacity-70 group-hover:opacity-100 group-hover:scale-100'}`} 
                    style={{ backgroundColor: theme.hex, boxShadow: currentColor === theme.hex ? `0 0 10px ${theme.hex}` : 'none' }}
                  ></span>
                  {currentColor === theme.hex && (
                    <span className="absolute -inset-1.5 rounded-full border border-white/30 animate-pulse"></span>
                  )}
               </button>
             ))}
           </div>

        </div>

        {/* Footer Hint */}
        {!showOnboarding && !handDetected && (
          <div className="flex items-center gap-2 text-white/30 text-[10px] tracking-widest uppercase animate-pulse mb-2">
             <Camera className="w-3 h-3" />
             <span>Waiting for input</span>
          </div>
        )}
      </div>

    </div>
  );
};