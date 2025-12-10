import React from 'react';
import { ShapeType } from '../types';
import { THEME_COLORS, SHAPE_LABELS } from '../constants';
import { Palette, Maximize2, Hand, Camera } from 'lucide-react';

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
          <h1 className="text-white text-2xl font-bold tracking-tighter drop-shadow-md">
            GestureFlow 3D
          </h1>
          <div className="flex items-center gap-2 mt-2">
             <div className={`w-2 h-2 rounded-full ${isCameraReady ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
             <span className="text-xs text-white/60 font-medium">
               {isCameraReady ? 'System Active' : 'Initializing Vision...'}
             </span>
          </div>
          {isCameraReady && (
            <div className="flex items-center gap-2 mt-1">
               <Hand className={`w-3 h-3 ${handDetected ? 'text-blue-400' : 'text-white/30'}`} />
               <span className={`text-xs transition-colors duration-300 ${handDetected ? 'text-blue-400' : 'text-white/30'}`}>
                 {handDetected ? 'Tracking Hands' : 'Show Hands to Control'}
               </span>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/10 hidden md:block">
           <div className="text-xs text-white/80 space-y-1">
             <div className="flex items-center gap-2">
               <Maximize2 className="w-3 h-3 text-blue-400" />
               <span>Move hands apart to <strong>Expand</strong></span>
             </div>
             <div className="flex items-center gap-2">
               <Hand className="w-3 h-3 text-pink-400" />
               <span>Close hands to <strong>Focus/Shrink</strong></span>
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
                   px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex-1 md:flex-none
                   ${currentShape === shape 
                     ? 'bg-white text-black shadow-lg scale-105' 
                     : 'text-white/60 hover:text-white hover:bg-white/10'}
                 `}
               >
                 {SHAPE_LABELS[shape]}
               </button>
             ))}
           </div>
        </div>

        {/* Color Selector */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl flex items-center gap-3">
           <Palette className="w-4 h-4 text-white/60" />
           <div className="flex gap-2">
             {THEME_COLORS.map((theme) => (
               <button
                 key={theme.name}
                 onClick={() => onColorChange(theme.hex)}
                 className={`
                   w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                   ${currentColor === theme.hex ? 'border-white scale-110 ring-2 ring-white/20' : 'border-transparent'}
                 `}
                 style={{ backgroundColor: theme.hex }}
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