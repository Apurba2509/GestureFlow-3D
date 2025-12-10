import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { HandMetrics } from '../types';

export const useHandTracking = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onMetricsUpdate: (metrics: HandMetrics) => void
) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const rafId = useRef<number | null>(null);
  const lastVideoTime = useRef<number>(-1);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        if (!mounted) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        if (!mounted) return;
        handLandmarkerRef.current = handLandmarker;
        setIsReady(true);
      } catch (e) {
        console.error("Failed to load MediaPipe:", e);
        setError("Failed to load computer vision model.");
      }
    };

    setup();

    return () => {
      mounted = false;
      handLandmarkerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!isReady || !videoRef.current) return;

    const video = videoRef.current;

    const calculateGrip = (landmarks: NormalizedLandmark[]) => {
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        const dIndex = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
        const dMiddle = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
        const dRing = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y);
        const dPinky = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y);
        
        const avgDist = (dIndex + dMiddle + dRing + dPinky) / 4;
        // Heuristic: Open hand approx 0.3-0.4, Fist approx 0.1-0.15
        const norm = Math.max(0, Math.min(1, (0.4 - avgDist) / 0.25));
        return norm;
    };

    const predict = () => {
      if (!handLandmarkerRef.current || !video) return;

      if (video.currentTime !== lastVideoTime.current && video.readyState >= 2) {
        lastVideoTime.current = video.currentTime;
        const results = handLandmarkerRef.current.detectForVideo(video, performance.now());

        let distance = 0;
        let leftGrip = 0;
        let rightGrip = 0;
        let isDetected = false;
        let position = { x: 0, y: 0 };

        if (results.landmarks && results.landmarks.length > 0) {
          isDetected = true;
          
          if (results.landmarks.length === 2) {
             const hand1 = results.landmarks[0][0];
             const hand2 = results.landmarks[1][0];
             
             // Distance
             const rawDist = Math.hypot(hand1.x - hand2.x, hand1.y - hand2.y);
             distance = Math.min(1, Math.max(0, (rawDist - 0.1) * 1.5));
             
             // Grip
             leftGrip = calculateGrip(results.landmarks[0]);
             rightGrip = calculateGrip(results.landmarks[1]);

             // Position (Center between hands)
             const avgX = (hand1.x + hand2.x) / 2;
             const avgY = (hand1.y + hand2.y) / 2;
             
             // Removed (1 - avgX) inversion to fix negative camera feed issue.
             // Now calculating directly: (0 to 1) -> (-1 to 1)
             position = {
                 x: avgX * 2 - 1,
                 y: -(avgY * 2 - 1)
             };

          } else {
             // 1 Hand detected
             const hand = results.landmarks[0][0];
             
             leftGrip = calculateGrip(results.landmarks[0]);
             rightGrip = leftGrip;
             distance = 0.5;
             
             // Removed (1 - hand.x) inversion
             position = {
                 x: hand.x * 2 - 1,
                 y: -(hand.y * 2 - 1)
             };
          }
        }

        onMetricsUpdate({
          isDetected,
          distance,
          leftGrip,
          rightGrip,
          avgGrip: (leftGrip + rightGrip) / 2,
          position
        });
      }

      rafId.current = requestAnimationFrame(predict);
    };

    // Start Webcam
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: 640,
            height: 480
          }
        });
        video.srcObject = stream;
        video.addEventListener("loadeddata", predict);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera permission denied or camera not found.");
      }
    };

    startCamera();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (video.srcObject) {
         (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [isReady, videoRef, onMetricsUpdate]);

  return { isReady, error };
};