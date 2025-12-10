import React from 'react';
import { ShapeType } from '../types';
import { THEME_COLORS, SHAPE_LABELS } from '../constants';
import { Palette, Maximize2, Hand, Monitor, AlertCircle } from 'lucide-react';

interface ControlsProps {
  currentShape: ShapeType;
  onShapeChange: (s: ShapeType) => void;
  currentColor: string;
  onColorChange: (c: string) => void;
  isCameraReady: boolean;
  handDetected: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  currentShape,
  onShapeChange,
  currentColor,
  onColorChange,
  isCameraReady,
  handDetected
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header / Status */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            GestureFlow 3D
          </h1>
          
          <div className="flex flex-col items-start gap-2 mt-4">
             {/* Camera System Status - Prominent when waiting for input */}
             <div className={`
               flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500
               ${!handDetected && isCameraReady
                 ? 'bg-white/5 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                 : 'border-transparent pl-0'
               }
             `}>
                <div className="relative flex h-2.5 w-2.5">
                  {!handDetected && isCameraReady && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCameraReady ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                </div>
                <span className={`text-xs font-medium tracking-wide transition-colors ${!handDetected && isCameraReady ? 'text-white' : 'text-white/50'}`}>
                  {isCameraReady ? 'Vision System Active' : 'Initializing Camera...'}
                </span>
             </div>

             {/* Hand Tracking Indicator - Glowing Aura when Active */}
             {isCameraReady && (
               <div className={`
                 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500
                 ${handDetected
                   ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] translate-x-2' 
                   : 'border-transparent pl-0 opacity-40'
                 }
               `}>
                  <Hand className={`w-4 h-4 transition-colors ${handDetected ? 'text-blue-400' : 'text-white'}`} />
                  <span className={`text-xs font-bold tracking-wide transition-colors ${handDetected ? 'text-blue-300' : 'text-white'}`}>
                    {handDetected ? 'TRACKING ACTIVE' : 'Raise Hands to Start'}
                  </span>
               </div>
             )}
          </div>
        </div>
        
        {/* Instructions Panel */}
        <div className={`
            bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 hidden md:block transition-all duration-500
            ${handDetected ? 'opacity-40 hover:opacity-100' : 'opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.05)]'}
        `}>
           <h3 className="text-white/40 text-[10px] uppercase font-bold mb-2 tracking-widest">Controls</h3>
           <div className="text-xs text-white/80 space-y-2.5">
             <div className="flex items-center gap-3">
               <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                 <Maximize2 className="w-3.5 h-3.5" />
               </div>
               <span>Move hands apart to <strong className="text-blue-300">Expand</strong></span>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-1.5 bg-pink-500/20 rounded-lg text-pink-400">
                 <Hand className="w-3.5 h-3.5" />
               </div>
               <span>Close hands to <strong className="text-pink-300">Focus</strong></span>
             </div>
           </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-4 pointer-events-auto items-center md:items-start max-w-xl">
        
        {/* Shape Selector */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl w-full">
           <div className="flex justify-between md:justify-start gap-1">
             {Object.values(ShapeType).map((shape) => (
               <button
                 key={shape}
                 onClick={() => onShapeChange(shape)}
                 className={`
                   px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex-1 md:flex-none
                   ${currentShape === shape 
                     ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' 
                     : 'text-white/40 hover:text-white hover:bg-white/10'}
                 `}
               >
                 {SHAPE_LABELS[shape]}
               </button>
             ))}
           </div>
        </div>

        {/* Color Selector */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl flex items-center gap-4">
           <Palette className="w-4 h-4 text-white/40 ml-1" />
           <div className="flex gap-3">
             {THEME_COLORS.map((theme) => (
               <button
                 key={theme.name}
                 onClick={() => onColorChange(theme.hex)}
                 className={`
                   w-6 h-6 rounded-full transition-all duration-300 hover:scale-125
                   ${currentColor === theme.hex 
                     ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black shadow-[0_0_10px_currentColor]' 
                     : 'opacity-70 hover:opacity-100'}
                 `}
                 style={{ backgroundColor: theme.hex, color: theme.hex }}
                 title={theme.name}
                 aria-label={`Select ${theme.name}`}
               />
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};