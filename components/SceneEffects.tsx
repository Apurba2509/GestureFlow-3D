import React, { useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const SceneEffects: React.FC = () => {
  const { gl } = useThree();

  const fader = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new THREE.PlaneGeometry(2, 2);
    // Dark fading plane:
    // Color matches the app background (#050505)
    // Opacity controls trail length (0.1 = long trails, 0.3 = short trails)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x050505,
      transparent: true,
      opacity: 0.15 
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    return { scene, camera };
  }, []);

  useEffect(() => {
    // Disable auto-clearing to allow trails to persist
    gl.autoClear = false;
    // Initial clear
    gl.setClearColor(0x050505);
    gl.clear();

    return () => {
      gl.autoClear = true;
    };
  }, [gl]);

  useFrame(() => {
    // 1. Render the semi-transparent fading plane on top of the previous frame
    gl.render(fader.scene, fader.camera);
    
    // 2. Clear the depth buffer so new particles are drawn correctly on top
    // (We do NOT clear the color buffer, creating the trail effect)
    gl.clearDepth();
  }, -1); // Negative priority ensures this runs before the main scene render

  return null;
};