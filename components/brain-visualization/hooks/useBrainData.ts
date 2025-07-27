'use client';

import { useState, useCallback } from 'react';
import { parseASCFile } from '../utils/ascParser';
import { parseAnnotationFile } from '../utils/annotationParser';
import type { BrainHemisphere } from '../types';

interface UseBrainDataResult {
  leftHemisphere?: BrainHemisphere;
  rightHemisphere?: BrainHemisphere;
  loading: boolean;
  error?: string;
  loadFromFiles: (files: FileList) => Promise<void>;
  loadFromUrls: (urls: { leftAsc?: string; rightAsc?: string; leftAnnot?: string; rightAnnot?: string }) => Promise<void>;
  clearError: () => void;
}

export function useBrainData(): UseBrainDataResult {
  const [leftHemisphere, setLeftHemisphere] = useState<BrainHemisphere>();
  const [rightHemisphere, setRightHemisphere] = useState<BrainHemisphere>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const loadFromFiles = useCallback(async (files: FileList) => {
    setLoading(true);
    setError(undefined);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.toLowerCase();
        const isLeft = fileName.startsWith('lh');
        const isAnnotation = fileName.endsWith('.annot') || fileName.endsWith('.json');
        
        if (isAnnotation) {
          // Read annotation file as ArrayBuffer
          const buffer = await file.arrayBuffer();
          const content = new Uint8Array(buffer);
          const annotation = await parseAnnotationFile(content);
          
          if (isLeft && leftHemisphere) {
            setLeftHemisphere({ ...leftHemisphere, annotation });
          } else if (!isLeft && rightHemisphere) {
            setRightHemisphere({ ...rightHemisphere, annotation });
          }
        } else {
          // Read ASC file as text
          const content = await file.text();
          const hemisphere = await parseASCFile(content, isLeft ? 'left' : 'right');
          if (isLeft) {
            setLeftHemisphere(hemisphere);
          } else {
            setRightHemisphere(hemisphere);
          }
        }
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brain data');
    } finally {
      setLoading(false);
    }
  }, [leftHemisphere, rightHemisphere]);

  const loadFromUrls = useCallback(async (urls: { 
    leftAsc?: string; 
    rightAsc?: string; 
    leftAnnot?: string; 
    rightAnnot?: string 
  }) => {
    setLoading(true);
    setError(undefined);

    try {
      const promises: Promise<void>[] = [];

      // Load ASC files
      if (urls.leftAsc) {
        promises.push(
          fetch(urls.leftAsc)
            .then(response => response.text())
            .then(content => parseASCFile(content, 'left'))
            .then(setLeftHemisphere)
        );
      }

      if (urls.rightAsc) {
        promises.push(
          fetch(urls.rightAsc)
            .then(response => response.text())
            .then(content => parseASCFile(content, 'right'))
            .then(setRightHemisphere)
        );
      }

      // Wait for ASC files to load first
      await Promise.all(promises);

      // Load annotation files
      const annotPromises: Promise<void>[] = [];

      if (urls.leftAnnot) {
        annotPromises.push(
          fetch(urls.leftAnnot)
            .then(response => response.arrayBuffer())
            .then(buffer => parseAnnotationFile(new Uint8Array(buffer)))
            .then(annotation => {
              setLeftHemisphere(prev => prev ? { ...prev, annotation } : undefined);
            })
        );
      }

      if (urls.rightAnnot) {
        annotPromises.push(
          fetch(urls.rightAnnot)
            .then(response => response.arrayBuffer())
            .then(buffer => parseAnnotationFile(new Uint8Array(buffer)))
            .then(annotation => {
              setRightHemisphere(prev => prev ? { ...prev, annotation } : undefined);
            })
        );
      }

      await Promise.all(annotPromises);

    } catch (err) {
      console.error('Error loading from URLs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brain data from URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    leftHemisphere,
    rightHemisphere,
    loading,
    error,
    loadFromFiles,
    loadFromUrls,
    clearError
  };
} 