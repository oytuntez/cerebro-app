'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { BrainHemisphere } from './types';

interface BrainMeshProps {
  hemisphere: BrainHemisphere
  transparency: number
  wireframe: boolean
  selectedRegions: Set<string>
  visible: boolean
}

export default function BrainMesh({ 
  hemisphere, 
  transparency, 
  wireframe, 
  selectedRegions,
  visible 
}: BrainMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create geometry from hemisphere data
  const geometry = useMemo(() => {
    if (!hemisphere.vertices || !hemisphere.faces) return null;

    const geom = new THREE.BufferGeometry();

    // Set vertices
    geom.setAttribute('position', new THREE.BufferAttribute(hemisphere.vertices, 3));

    // Set faces
    geom.setIndex(new THREE.BufferAttribute(hemisphere.faces, 1));

    // Compute normals for proper lighting
    geom.computeVertexNormals();

    return geom;
  }, [hemisphere]);

  // Create colored geometry if annotations exist
  const coloredGeometry = useMemo(() => {
    if (!hemisphere.annotation?.regions || !geometry) return null;

    const geom = geometry.clone();
    const colors = new Float32Array(hemisphere.vertices.length);
    const regionMap = hemisphere.annotation.regions;
    const vertexLabels = hemisphere.annotation.vertices;

    // Color vertices based on region selection
    for (let i = 0; i < vertexLabels.length; i++) {
      const label = vertexLabels[i];
      const region = regionMap[label];

      if (region && selectedRegions.has(region.name)) {
        // Selected region - use region color
        colors[i * 3] = region.color[0];
        colors[i * 3 + 1] = region.color[1];
        colors[i * 3 + 2] = region.color[2];
      } else {
        // Unselected or no region - use grey
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.7;
      }
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [geometry, hemisphere.annotation, selectedRegions]);

  const material = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      vertexColors: coloredGeometry ? true : false,
      wireframe,
      transparent: transparency > 0,
      opacity: 1 - transparency,
      color: coloredGeometry ? undefined : 0xaaaaaa
    });
  }, [wireframe, transparency, coloredGeometry]);

  if (!visible || !geometry) return null;

  return (
    <mesh 
      ref={meshRef}
      geometry={coloredGeometry || geometry}
      material={material}
      position={hemisphere.side === 'left' ? [-50, 0, 0] : [50, 0, 0]}
    />
  );
}
