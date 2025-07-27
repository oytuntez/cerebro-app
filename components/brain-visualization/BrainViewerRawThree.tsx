'use client';

import { useEffect, useRef, useState } from 'react';
import type { BrainViewerProps } from './types';
import { cn } from '@/lib/utils';

export default function BrainViewerRawThree({ className, ...props }: BrainViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let mounted = true;
    let scene: any, camera: any, renderer: any, cube: any, controls: any;
    let animationId: number;

    const init3D = async () => {
      try {
        setStatus('Loading Three.js...');
        
        // Load raw Three.js
        const THREE = await import('three');
        if (!mounted) return;

        setStatus('Loading controls...');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (!mounted) return;

        setStatus('Creating 3D scene...');
        
        if (!canvasRef.current) return;

        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111827); // gray-950

        // Create camera
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(5, 5, 5);

        // Create renderer
        renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current,
          antialias: true 
        });
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Create a simple cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xff6b35 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);

        // Add controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          
          animationId = requestAnimationFrame(animate);
          
          // Rotate cube
          if (cube) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
          }
          
          if (controls) controls.update();
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };

        setStatus('Starting animation...');
        animate();
        setStatus('Ready!');

      } catch (err: any) {
        console.error('Raw Three.js error:', err);
        if (mounted) {
          setError(err.message);
          setStatus('Failed');
        }
      }
    };

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !renderer || !camera) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);
    
    // Start with delay
    const timer = setTimeout(init3D, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (renderer) {
        renderer.dispose();
      }
      
      if (scene) {
        scene.clear();
      }
    };
  }, []);

  if (error) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-red-900 flex items-center justify-center", className)}>
        <div className="text-white text-center">
          <p className="text-lg font-semibold">Raw Three.js Error</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full min-h-[600px] relative", className)}>
      {status !== 'Ready!' && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-sm">{status}</p>
          </div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
} 