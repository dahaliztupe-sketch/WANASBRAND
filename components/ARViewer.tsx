'use client';

import { useEffect, useRef, useState } from 'react';
import { X, View } from 'lucide-react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ARViewerProps {
  modelUrl: string;
  onClose: () => void;
}

export default function ARViewer({ modelUrl, onClose }: ARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    currentContainer.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 3. Load Model with DRACO
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        
        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        scene.add(model);
      },
      (xhr) => {
        setLoadingProgress((xhr.loaded / xhr.total) * 100);
      },
      (error) => {
        console.error('An error happened while loading the 3D model:', error);
      }
    );

    // 4. Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 5. Handle Resize
    const handleResize = () => {
      if (!currentContainer) return;
      camera.aspect = currentContainer.clientWidth / currentContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Memory Cleanup (WAN-038)
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
      dracoLoader.dispose();
      if (currentContainer) {
        currentContainer.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 backdrop-blur-xl"
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-10 p-2 text-secondary/50 hover:text-secondary transition-colors rounded-full bg-primary/10 hover:bg-primary/20"
      >
        <X strokeWidth={1} size={28} />
      </button>

      <div className="w-full h-full relative max-w-5xl mx-auto flex flex-col items-center justify-center p-4 md:p-12">
        <div ref={containerRef} className="w-full h-full outline-none" />
        
        {loadingProgress < 100 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-secondary/50">
            <div className="w-12 h-[1px] bg-secondary/20 overflow-hidden">
              <div 
                className="h-full bg-accent-primary transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-light">
              {loadingProgress > 0 ? `Loading ${Math.round(loadingProgress)}%` : 'Preparing 3D Model'}
            </p>
          </div>
        )}

        <button 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-4 bg-accent-primary text-inverted text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-accent-primary/90 transition-all"
          onClick={() => window.open(modelUrl, '_blank')}
        >
          <View size={16} strokeWidth={1.5} />
          View in Your Space
        </button>
      </div>
    </motion.div>
  );
}
