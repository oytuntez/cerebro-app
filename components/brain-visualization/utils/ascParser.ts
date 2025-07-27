import type { BrainHemisphere } from '../types';

export async function parseASCFile(
  content: string,
  side: 'left' | 'right'
): Promise<BrainHemisphere> {
  const lines = content.trim().split('\n');
  
  if (lines.length < 3) {
    throw new Error('Invalid ASC file format');
  }

  // Skip the first line if it's a comment (starts with #)
  let headerLineIndex = 0;
  if (lines[0].startsWith('#')) {
    headerLineIndex = 1;
  }

  // Parse vertex and face counts from the header line
  const headerLine = lines[headerLineIndex].trim().split(/\s+/);
  const vertexCount = parseInt(headerLine[0]);
  const faceCount = parseInt(headerLine[1]);

  if (isNaN(vertexCount) || isNaN(faceCount)) {
    throw new Error('Invalid vertex or face count in ASC file');
  }

  // Parse vertices (starting after the header line)
  const vertices = new Float32Array(vertexCount * 3);
  let vertexIndex = 0;
  const vertexStartLine = headerLineIndex + 1;

  for (let i = vertexStartLine; i < vertexStartLine + vertexCount; i++) {
    const line = lines[i];
    if (!line) continue;
    
    const coords = line.trim().split(/\s+/).map(Number);
    if (coords.length >= 3) {
      vertices[vertexIndex * 3] = coords[0];
      vertices[vertexIndex * 3 + 1] = coords[1];
      vertices[vertexIndex * 3 + 2] = coords[2];
      vertexIndex++;
    }
  }

  // Parse faces (starting after all vertices)
  const faces = new Uint32Array(faceCount * 3);
  let faceIndex = 0;
  const faceStartLine = vertexStartLine + vertexCount;

  for (let i = faceStartLine; i < faceStartLine + faceCount; i++) {
    const line = lines[i];
    if (!line) continue;
    
    const faceIndices = line.trim().split(/\s+/).map(Number);
    if (faceIndices.length >= 3) {
      faces[faceIndex * 3] = faceIndices[0];
      faces[faceIndex * 3 + 1] = faceIndices[1];
      faces[faceIndex * 3 + 2] = faceIndices[2];
      faceIndex++;
    }
  }

  return {
    side,
    vertices,
    faces
  };
} 