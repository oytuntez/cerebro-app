import type { BrainAnnotation, BrainRegion } from '../types';

export async function parseAnnotationFile(data: Uint8Array): Promise<BrainAnnotation> {
  try {
    // Try parsing as JSON first
    const text = new TextDecoder().decode(data);
    const jsonData = JSON.parse(text);
    
    if (jsonData && typeof jsonData === 'object') {
      // Handle both direct region objects and wrapped formats
      const regions: { [key: number]: BrainRegion } = {};
      
      // If it's already in the right format
      if (jsonData.regions || Array.isArray(jsonData) || typeof jsonData === 'object') {
        const regionData = jsonData.regions || jsonData;
        
        if (Array.isArray(regionData)) {
          // Handle array format
          regionData.forEach((region: any, index: number) => {
            if (region && region.name) {
              let color: [number, number, number];
              
              // Handle both object {r, g, b} and array [r, g, b] color formats
              if (region.color) {
                if (Array.isArray(region.color)) {
                  color = region.color;
                } else if (typeof region.color === 'object' && 'r' in region.color) {
                  // Convert from {r, g, b} format - values are already in 0-255 range
                  color = [region.color.r, region.color.g, region.color.b];
                } else {
                  color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
                }
              } else {
                color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
              }
              
              regions[index] = {
                id: region.id || index,
                name: region.name,
                color
              };
            }
          });
        } else {
          // Handle object format
          Object.entries(regionData).forEach(([key, region]: [string, any]) => {
            if (region && typeof region === 'object') {
              const id = parseInt(key) || region.id || 0;
              let color: [number, number, number];
              
              // Handle both object {r, g, b} and array [r, g, b] color formats
              if (region.color) {
                if (Array.isArray(region.color)) {
                  color = region.color;
                } else if (typeof region.color === 'object' && 'r' in region.color) {
                  // Convert from {r, g, b} format - values are already in 0-255 range
                  color = [region.color.r, region.color.g, region.color.b];
                } else {
                  color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
                }
              } else {
                color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
              }
              
              regions[id] = {
                id,
                name: region.name || `Region ${id}`,
                color
              };
            }
          });
        }
      }
      
      return {
        vertices: jsonData.vertices || jsonData.labels || [],
        regions
      };
    }
  } catch (e) {
    console.warn('Failed to parse as JSON, attempting binary format:', e);
  }

  // Fall back to binary annotation format parsing
  return parseBinaryAnnotation(data);
}

function parseBinaryAnnotation(data: Uint8Array): BrainAnnotation {
  const view = new DataView(data.buffer);
  let offset = 0;

  // Read vertex count
  const vertexCount = view.getUint32(offset, true);
  offset += 4;

  // Read vertex annotations
  const vertices: number[] = [];
  for (let i = 0; i < vertexCount; i++) {
    vertices.push(view.getUint32(offset, true));
    offset += 4;
  }

  // Generate regions from unique vertex labels
  const uniqueLabels = Array.from(new Set(vertices));
  const regions: { [key: number]: BrainRegion } = {};
  
  uniqueLabels.forEach((label, index) => {
    if (label !== 0) { // Skip background label
      regions[label] = {
        id: label,
        name: `Region ${label}`,
        color: [
          Math.random() * 255,
          Math.random() * 255, 
          Math.random() * 255
        ]
      };
    }
  });

  return {
    vertices,
    regions
  };
} 