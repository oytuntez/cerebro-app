export interface BrainRegion {
  id: number;
  name: string;
  color: [number, number, number];
}

export interface BrainAnnotation {
  vertices: number[];
  regions: { [key: number]: BrainRegion };
}

export interface BrainHemisphere {
  side: 'left' | 'right';
  vertices: Float32Array;
  faces: Uint32Array;
  annotation?: BrainAnnotation;
}

export interface BrainData {
  left?: BrainHemisphere;
  right?: BrainHemisphere;
}

export interface BrainViewerProps {
  leftHemisphere?: BrainHemisphere;
  rightHemisphere?: BrainHemisphere;
  showLeftHemi?: boolean;
  showRightHemi?: boolean;
  transparency?: number;
  wireframe?: boolean;
  selectedRegions?: Set<string>;
  className?: string;
}

export interface BrainControlsProps {
  showLeftHemi: boolean;
  showRightHemi: boolean;
  transparency: number;
  wireframe: boolean;
  selectedRegions: Set<string>;
  availableRegions: string[];
  onToggleLeftHemi: () => void;
  onToggleRightHemi: () => void;
  onTransparencyChange: (value: number) => void;
  onWireframeToggle: () => void;
  onRegionToggle: (regionName: string) => void;
  onSelectAllRegions: () => void;
  onUnselectAllRegions: () => void;
} 