'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import type { BrainViewerProps, BrainHemisphere } from './types';
import { cn } from '@/lib/utils';

export default function BrainViewerClientOnly({
  leftHemisphere,
  rightHemisphere,
  showLeftHemi = true,
  showRightHemi = true,
  transparency = 0,
  wireframe = false,
  selectedRegions = new Set(),
  className
}: BrainViewerProps) {
  const [components, setComponents] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadComponents = async () => {
      try {
        // Load all Three.js components dynamically
        const [fiberModule, dreiModule, threeModule] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('three')
        ]);

        if (!mounted) return;

        // Create BrainMesh component dynamically
        const BrainMesh = ({ hemisphere, transparency, wireframe, selectedRegions, visible }: {
          hemisphere: BrainHemisphere;
          transparency: number;
          wireframe: boolean;
          selectedRegions: Set<string>;
          visible: boolean;
        }) => {
          const meshRef = useRef<any>(null);
          const THREE = threeModule;

          const geometry = useMemo(() => {
            if (!hemisphere.vertices || !hemisphere.faces) return null;
            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.BufferAttribute(hemisphere.vertices, 3));
            geom.setIndex(new THREE.BufferAttribute(hemisphere.faces, 1));
            geom.computeVertexNormals();
            return geom;
          }, [hemisphere, THREE]);

          const coloredGeometry = useMemo(() => {
            if (!hemisphere.annotation?.regions || !geometry) return null;
            const geom = geometry.clone();
            const colors = new Float32Array(hemisphere.vertices.length);
            const regionMap = hemisphere.annotation.regions;
            const vertexLabels = hemisphere.annotation.vertices;

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
            geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            return geom;
          }, [geometry, hemisphere.annotation, selectedRegions, THREE]);

          const material = useMemo(() => {
            return new THREE.MeshLambertMaterial({
              vertexColors: coloredGeometry ? true : false,
              wireframe,
              transparent: transparency > 0,
              opacity: 1 - transparency,
              color: coloredGeometry ? undefined : 0xaaaaaa
            });
          }, [wireframe, transparency, coloredGeometry, THREE]);

          if (!visible || !geometry) return null;

          return React.createElement('mesh', {
            ref: meshRef,
            geometry: coloredGeometry || geometry,
            material: material,
            position: hemisphere.side === 'left' ? [-50, 0, 0] : [50, 0, 0]
          });
        };

        setComponents({
          Canvas: fiberModule.Canvas,
          OrbitControls: dreiModule.OrbitControls,
          PerspectiveCamera: dreiModule.PerspectiveCamera,
          BrainMesh: BrainMesh
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to load Three.js components:', err);
        if (mounted) {
          setError('Failed to load 3D components');
          setLoading(false);
        }
      }
    };

    loadComponents();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">Loading 3D Engine...</p>
        </div>
      </div>
    );
  }

  if (error || !components) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", className)}>
        <div className="text-center text-red-400">
          <p>Failed to load 3D components</p>
          <p className="text-sm mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  const { Canvas, OrbitControls, PerspectiveCamera, BrainMesh } = components;

  return (
    <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden", className)}>
      {React.createElement(Canvas, {
        gl: { antialias: true, alpha: true },
        camera: { position: [200, 100, 200], fov: 50 }
      }, [
        React.createElement(React.Suspense, { fallback: null, key: 'suspense' }, [
          React.createElement('ambientLight', { intensity: 0.4, key: 'ambient' }),
          React.createElement('directionalLight', { 
            position: [100, 100, 100], 
            intensity: 0.8, 
            castShadow: true,
            key: 'dir1' 
          }),
          React.createElement('directionalLight', { 
            position: [-100, -100, -100], 
            intensity: 0.3,
            key: 'dir2' 
          }),
          
          leftHemisphere && React.createElement(BrainMesh, {
            hemisphere: leftHemisphere,
            transparency,
            wireframe,
            selectedRegions,
            visible: showLeftHemi,
            key: 'left-mesh'
          }),
          
          rightHemisphere && React.createElement(BrainMesh, {
            hemisphere: rightHemisphere,
            transparency,
            wireframe,
            selectedRegions,
            visible: showRightHemi,
            key: 'right-mesh'
          }),
          
          React.createElement(OrbitControls, {
            enablePan: true,
            enableZoom: true,
            enableRotate: true,
            maxDistance: 500,
            minDistance: 50,
            key: 'controls'
          }),
          
          React.createElement(PerspectiveCamera, {
            makeDefault: true,
            position: [200, 100, 200],
            fov: 50,
            key: 'camera'
          })
        ])
      ])}
    </div>
  );
} 