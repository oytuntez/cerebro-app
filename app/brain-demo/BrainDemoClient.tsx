'use client';

import React, { useEffect } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BrainViewer, 
  BrainControls, 
  useBrainData, 
  useBrainControls 
} from '@/components/brain-visualization';

export default function BrainDemoClient() {
  const { 
    leftHemisphere, 
    rightHemisphere, 
    loading, 
    error, 
    loadFromFiles, 
    loadFromUrls,
    clearError 
  } = useBrainData();

  const {
    showLeftHemi,
    showRightHemi,
    transparency,
    wireframe,
    selectedRegions,
    availableRegions,
    toggleLeftHemi,
    toggleRightHemi,
    handleTransparencyChange,
    toggleWireframe,
    toggleRegion,
    selectAllRegions,
    unselectAllRegions,
    initializeRegions
  } = useBrainControls({ leftHemisphere, rightHemisphere });

  // Initialize regions when data loads
  useEffect(() => {
    initializeRegions();
  }, [initializeRegions]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await loadFromFiles(files);
      // Reset the input to allow re-uploading the same files
      event.target.value = '';
    }
  };

  const loadDemoData = async () => {
    // Load demo data from the public directory
    await loadFromUrls({
      leftAsc: '/lh.asc',
      rightAsc: '/rh.asc',
      leftAnnot: '/lh.custom_regions_de_ki.json',
      rightAnnot: '/rh.custom_regions_de_ki.json'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Brain Visualization Demo</h1>
          <p className="text-muted-foreground mt-2">
            Interactive 3D brain surface visualization with region selection and controls
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload & Demo Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Load Brain Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brain-files">Upload Brain Files</Label>
                <Input
                  id="brain-files"
                  type="file"
                  multiple
                  accept=".asc,.annot,.json"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Upload .asc files (brain surfaces) and .annot/.json files (region annotations)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Demo Data</Label>
                <Button
                  onClick={loadDemoData}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Load Demo Brain Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  Load sample brain data from the original project
                </p>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading brain data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        {(leftHemisphere || rightHemisphere) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Brain Viewer */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>3D Brain Visualization</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <BrainViewer
                    leftHemisphere={leftHemisphere}
                    rightHemisphere={rightHemisphere}
                    showLeftHemi={showLeftHemi}
                    showRightHemi={showRightHemi}
                    transparency={transparency}
                    wireframe={wireframe}
                    selectedRegions={selectedRegions}
                    className="h-[700px]"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="lg:col-span-1">
              <BrainControls
                showLeftHemi={showLeftHemi}
                showRightHemi={showRightHemi}
                transparency={transparency}
                wireframe={wireframe}
                selectedRegions={selectedRegions}
                availableRegions={availableRegions}
                onToggleLeftHemi={toggleLeftHemi}
                onToggleRightHemi={toggleRightHemi}
                onTransparencyChange={handleTransparencyChange}
                onWireframeToggle={toggleWireframe}
                onRegionToggle={toggleRegion}
                onSelectAllRegions={selectAllRegions}
                onUnselectAllRegions={unselectAllRegions}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        {!leftHemisphere && !rightHemisphere && !loading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h3>How to use the Brain Visualization:</h3>
                <ol>
                  <li><strong>Load Demo Data:</strong> Click "Load Demo Brain Data" to see the visualization in action</li>
                  <li><strong>Upload Files:</strong> Upload your own .asc (surface) and .annot/.json (annotation) files</li>
                  <li><strong>Interactive Controls:</strong> Use the control panel to toggle hemispheres, adjust transparency, and select brain regions</li>
                  <li><strong>3D Navigation:</strong> Click and drag to rotate, scroll to zoom, right-click and drag to pan</li>
                </ol>
                
                <h3>Supported File Formats:</h3>
                <ul>
                  <li><strong>.asc files:</strong> ASCII brain surface files (lh.asc for left, rh.asc for right)</li>
                  <li><strong>.annot files:</strong> Binary annotation files with region labels</li>
                  <li><strong>.json files:</strong> JSON annotation files with region definitions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 