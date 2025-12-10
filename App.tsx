import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ShapeType, HandMetrics } from './types';
import { THEME_COLORS } from './constants';
import { Particles } from './components/Particles';
import { Controls } from './components/Controls';
import { useHandTracking } from './hooks/useHandTracking';
import { SceneEffects } from './components/SceneEffects';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.HEART);
  const [currentColor, setCurrentColor] = useState<string>(THEME_COLORS[0].hex);
  const [isHandDetected, setIsHandDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Mutable ref for high-frequency updates without re-renders
  const handRef = useRef<HandMetrics>({
    isDetected: false,
    distance: 0,
    leftGrip: 0,
    rightGrip: 0,
    avgGrip: 0,
    position: { x: 0, y: 0 }
  });

  const { isReady: isVisionReady, error: visionError } = useHandTracking(videoRef, (metrics) => {
    handRef.current = metrics;
    // Only update state if detection status changes to minimize re-renders
    if (metrics.isDetected !== isHandDetected) {
      setIsHandDetected(metrics.isDetected);
    }
  });

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Hidden Video Element for MediaPipe */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 opacity-0 pointer-events-none"
        playsInline
        autoPlay
        muted
        width="640"
        height="480"
      />

      {/* 3D Scene */}
      <Canvas 
        camera={{ position: [0, 0, 14], fov: 45 }} 
        dpr={[1, 2]}
        gl={{ 
          preserveDrawingBuffer: true, // Required for trails
          antialias: true,
          alpha: false
        }}
      >
        {/* Note: Background color is handled by SceneEffects for trails */}
        <SceneEffects />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Particles 
          shapeType={currentShape} 
          color={currentColor} 
          handRef={handRef} 
        />
        
        <OrbitControls 
          enableZoom={true} 
          zoomSpeed={0.6}
          enablePan={true}
          panSpeed={0.6}
          enableRotate={true}
          rotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={!isHandDetected}
          autoRotateSpeed={0.5} 
          maxDistance={20}
          minDistance={2}
        />
      </Canvas>

      {/* UI Overlay */}
      <Controls
        currentShape={currentShape}
        onShapeChange={setCurrentShape}
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        isCameraReady={isVisionReady}
        handDetected={isHandDetected}
      />
      
      {/* Error Toast */}
      {visionError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm shadow-xl">
          {visionError}
        </div>
      )}
    </div>
  );
};

export default App;