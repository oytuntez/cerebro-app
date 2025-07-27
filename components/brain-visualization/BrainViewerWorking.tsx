'use client';

import { useEffect, useRef, useState } from 'react';
import type { BrainViewerProps } from './types';
import { cn } from '@/lib/utils';

export default function BrainViewerWorking({ 
  leftHemisphere,
  rightHemisphere,
  showLeftHemi = true,
  showRightHemi = true,
  transparency = 0,
  wireframe = false,
  selectedRegions = new Set(),
  className,
  ...props 
}: BrainViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let mounted = true;
    let scene: any, camera: any, renderer: any, controls: any;
    let leftMesh: any, rightMesh: any;
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
        scene.background = new THREE.Color(0x1f2937); // lighter gray-800

        // Create camera
        camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        camera.position.set(200, 100, 200);

        // Create renderer
        renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current,
          antialias: true 
        });
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Add brighter lights for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight1.position.set(100, 100, 100);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight2.position.set(-100, -100, -100);
        scene.add(directionalLight2);

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight3.position.set(0, 100, 0);
        scene.add(directionalLight3);

        const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight4.position.set(0, -100, 0);
        scene.add(directionalLight4);

        // Add controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.maxDistance = 500;
        controls.minDistance = 50;
        controls.enableDamping = true;

        setStatus('Creating brain meshes...');

        // Create brain meshes if data is available
        if (leftHemisphere && leftHemisphere.vertices && leftHemisphere.faces) {
          const leftGeometry = new THREE.BufferGeometry();
          leftGeometry.setAttribute('position', new THREE.BufferAttribute(leftHemisphere.vertices, 3));
          leftGeometry.setIndex(new THREE.BufferAttribute(leftHemisphere.faces, 1));
          leftGeometry.computeVertexNormals();

          // Create colored vertices if annotations exist
          if (leftHemisphere.annotation?.regions && leftHemisphere.annotation?.vertices) {
            const colors = new Float32Array(leftHemisphere.vertices.length);
            const regionMap = leftHemisphere.annotation.regions;
            const vertexLabels = leftHemisphere.annotation.vertices;

            for (let i = 0; i < vertexLabels.length; i++) {
              const label = vertexLabels[i];
              const region = regionMap[label];
              
              if (region && selectedRegions.has(region.name)) {
                colors[i * 3] = region.color[0];
                colors[i * 3 + 1] = region.color[1];
                colors[i * 3 + 2] = region.color[2];
              } else {
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.7;
                colors[i * 3 + 2] = 0.7;
              }
            }
            leftGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          }

          const leftMaterial = new THREE.MeshStandardMaterial({
            vertexColors: leftHemisphere.annotation ? true : false,
            wireframe,
            transparent: transparency > 0,
            opacity: 1 - transparency,
            color: leftHemisphere.annotation ? undefined : 0xd4d4d8, // lighter gray-300
            emissive: 0x333333, // subtle glow
            emissiveIntensity: 0.1,
            roughness: 0.7,
            metalness: 0.1
          });

          leftMesh = new THREE.Mesh(leftGeometry, leftMaterial);
          leftMesh.position.set(-50, 0, 0);
          leftMesh.visible = showLeftHemi;
          scene.add(leftMesh);
        }

        if (rightHemisphere && rightHemisphere.vertices && rightHemisphere.faces) {
          const rightGeometry = new THREE.BufferGeometry();
          rightGeometry.setAttribute('position', new THREE.BufferAttribute(rightHemisphere.vertices, 3));
          rightGeometry.setIndex(new THREE.BufferAttribute(rightHemisphere.faces, 1));
          rightGeometry.computeVertexNormals();

          // Create colored vertices if annotations exist
          if (rightHemisphere.annotation?.regions && rightHemisphere.annotation?.vertices) {
            const colors = new Float32Array(rightHemisphere.vertices.length);
            const regionMap = rightHemisphere.annotation.regions;
            const vertexLabels = rightHemisphere.annotation.vertices;

            for (let i = 0; i < vertexLabels.length; i++) {
              const label = vertexLabels[i];
              const region = regionMap[label];
              
              if (region && selectedRegions.has(region.name)) {
                colors[i * 3] = region.color[0];
                colors[i * 3 + 1] = region.color[1];
                colors[i * 3 + 2] = region.color[2];
              } else {
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.7;
                colors[i * 3 + 2] = 0.7;
              }
            }
            rightGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          }

          const rightMaterial = new THREE.MeshStandardMaterial({
            vertexColors: rightHemisphere.annotation ? true : false,
            wireframe,
            transparent: transparency > 0,
            opacity: 1 - transparency,
            color: rightHemisphere.annotation ? undefined : 0xd4d4d8, // lighter gray-300
            emissive: 0x333333, // subtle glow
            emissiveIntensity: 0.1,
            roughness: 0.7,
            metalness: 0.1
          });

          rightMesh = new THREE.Mesh(rightGeometry, rightMaterial);
          rightMesh.position.set(50, 0, 0);
          rightMesh.visible = showRightHemi;
          scene.add(rightMesh);
        }

        // If no brain data, show a placeholder
        if (!leftHemisphere && !rightHemisphere) {
          const geometry = new THREE.SphereGeometry(30, 32, 32);
          const material = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            wireframe: true 
          });
          const sphere = new THREE.Mesh(geometry, material);
          scene.add(sphere);
        }

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          
          animationId = requestAnimationFrame(animate);
          
          if (controls) controls.update();
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };

        setStatus('Starting render...');
        animate();
        setStatus('Ready!');

      } catch (err: any) {
        console.error('Brain viewer error:', err);
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
  }, [leftHemisphere, rightHemisphere, showLeftHemi, showRightHemi, transparency, wireframe, selectedRegions]);

  if (error) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-red-900 flex items-center justify-center", className)}>
        <div className="text-white text-center">
          <p className="text-lg font-semibold">Brain Viewer Error</p>
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