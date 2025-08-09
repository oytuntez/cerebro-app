'use client'

import { useEffect, useRef, useState } from 'react'
import type { BrainViewerProps } from './types'
import { cn } from '@/lib/utils'

interface BrainViewerWorkingProps extends BrainViewerProps {
  transparentBackground?: boolean
}

export default function BrainViewer({
  leftHemisphere,
  rightHemisphere,
  showLeftHemi = true,
  showRightHemi = true,
  transparency = 0,
  wireframe = false,
  selectedRegions = new Set(),
  transparentBackground = false,
  className,
  ...props
}: BrainViewerWorkingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true
    let scene: any, camera: any, renderer: any, controls: any
    let leftMesh: any, rightMesh: any
    let animationId: number
    let resizeObserver: ResizeObserver

    const init3D = async () => {
      try {
        setStatus('Loading Three.js...')

        // Load raw Three.js
        const THREE = await import('three')
        if (!mounted) return

        setStatus('Loading controls...')
        const { OrbitControls } = await import(
          'three/examples/jsm/controls/OrbitControls.js'
        )
        if (!mounted) return

        setStatus('Creating 3D scene...')

        if (!canvasRef.current) return

        // Create scene
        scene = new THREE.Scene()
        if (!transparentBackground) {
          scene.background = new THREE.Color(0x1f2937) // lighter gray-800
        }

        // Create renderer first
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: transparentBackground, // Enable transparency if needed
        })

        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const aspect = rect.width / rect.height

        // Let CSS handle the display size, just set the rendering resolution
        renderer.setSize(rect.width, rect.height, false) // false = don't set CSS size
        renderer.setPixelRatio(window.devicePixelRatio)

        // Create camera with proper aspect ratio
        camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
        camera.position.set(200, 100, 200)

        // Add brighter lights for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
        scene.add(ambientLight)

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2)
        directionalLight1.position.set(100, 100, 100)
        scene.add(directionalLight1)

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight2.position.set(-100, -100, -100)
        scene.add(directionalLight2)

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6)
        directionalLight3.position.set(0, 100, 0)
        scene.add(directionalLight3)

        const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.6)
        directionalLight4.position.set(0, -100, 0)
        scene.add(directionalLight4)

        // Add controls
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enablePan = true
        controls.enableZoom = true
        controls.enableRotate = true
        controls.maxDistance = 500
        controls.minDistance = 50
        controls.enableDamping = true

        // Handle resize
        const handleResize = () => {
          if (!canvas || !renderer || !camera) return
          const rect = canvas.getBoundingClientRect()
          const newAspect = rect.width / rect.height

          renderer.setSize(rect.width, rect.height, false) // false = don't set CSS size
          camera.aspect = newAspect
          camera.updateProjectionMatrix()
        }

        // Add resize observer
        resizeObserver = new ResizeObserver(handleResize)
        resizeObserver.observe(canvas)

        setStatus('Creating brain meshes...')

        // Create brain meshes if data is available
        if (leftHemisphere && leftHemisphere.vertices && leftHemisphere.faces) {
          const leftGeometry = new THREE.BufferGeometry()
          leftGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(leftHemisphere.vertices, 3)
          )
          leftGeometry.setIndex(
            new THREE.BufferAttribute(leftHemisphere.faces, 1)
          )
          leftGeometry.computeVertexNormals()

          // Create colored vertices if annotations exist
          if (
            leftHemisphere.annotation?.regions &&
            leftHemisphere.annotation?.vertices
          ) {
            const colors = new Float32Array(leftHemisphere.vertices.length)
            const regionMap = leftHemisphere.annotation.regions
            const vertexLabels = leftHemisphere.annotation.vertices

            for (let i = 0; i < vertexLabels.length; i++) {
              const label = vertexLabels[i]
              const region = regionMap[label]

              if (region) {
                // Normalize colors from 0-255 to 0-1 range
                colors[i * 3] = region.color[0] / 255
                colors[i * 3 + 1] = region.color[1] / 255
                colors[i * 3 + 2] = region.color[2] / 255
              } else {
                // Default light gray color
                colors[i * 3] = 0.85
                colors[i * 3 + 1] = 0.85
                colors[i * 3 + 2] = 0.85
              }
            }
            leftGeometry.setAttribute(
              'color',
              new THREE.BufferAttribute(colors, 3)
            )
          }

          const leftMaterial = new THREE.MeshStandardMaterial({
            vertexColors: leftHemisphere.annotation ? true : false,
            wireframe,
            transparent: transparency > 0,
            opacity: 1 - transparency,
            emissive: 0x333333, // subtle glow
            emissiveIntensity: 0.1,
            roughness: 0.7,
            metalness: 0.1,
          })

          // Only set color if we're not using vertex colors
          if (!leftHemisphere.annotation) {
            leftMaterial.color.setHex(0xffffff)
          }

          leftMesh = new THREE.Mesh(leftGeometry, leftMaterial)
          leftMesh.position.set(0, 0, 0)
          leftMesh.visible = showLeftHemi
          scene.add(leftMesh)
        }

        if (
          rightHemisphere &&
          rightHemisphere.vertices &&
          rightHemisphere.faces
        ) {
          const rightGeometry = new THREE.BufferGeometry()
          rightGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(rightHemisphere.vertices, 3)
          )
          rightGeometry.setIndex(
            new THREE.BufferAttribute(rightHemisphere.faces, 1)
          )
          rightGeometry.computeVertexNormals()

          // Create colored vertices if annotations exist
          if (
            rightHemisphere.annotation?.regions &&
            rightHemisphere.annotation?.vertices
          ) {
            const colors = new Float32Array(rightHemisphere.vertices.length)
            const regionMap = rightHemisphere.annotation.regions
            const vertexLabels = rightHemisphere.annotation.vertices

            for (let i = 0; i < vertexLabels.length; i++) {
              const label = vertexLabels[i]
              const region = regionMap[label]

              if (region) {
                // Normalize colors from 0-255 to 0-1 range
                colors[i * 3] = region.color[0] / 255
                colors[i * 3 + 1] = region.color[1] / 255
                colors[i * 3 + 2] = region.color[2] / 255
              } else {
                // Default light gray color
                colors[i * 3] = 0.85
                colors[i * 3 + 1] = 0.85
                colors[i * 3 + 2] = 0.85
              }
            }
            rightGeometry.setAttribute(
              'color',
              new THREE.BufferAttribute(colors, 3)
            )
          }

          const rightMaterial = new THREE.MeshStandardMaterial({
            vertexColors: rightHemisphere.annotation ? true : false,
            wireframe,
            transparent: transparency > 0,
            opacity: 1 - transparency,
            emissive: 0x333333, // subtle glow
            emissiveIntensity: 0.1,
            roughness: 0.7,
            metalness: 0.1,
          })

          // Only set color if we're not using vertex colors
          if (!rightHemisphere.annotation) {
            rightMaterial.color.setHex(0xffffff)
          }

          rightMesh = new THREE.Mesh(rightGeometry, rightMaterial)
          rightMesh.position.set(0, 0, 0)
          rightMesh.visible = showRightHemi
          scene.add(rightMesh)
        }

        // If no brain data, show a placeholder
        if (!leftHemisphere && !rightHemisphere) {
          const geometry = new THREE.SphereGeometry(30, 32, 32)
          const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            wireframe: true,
          })
          const sphere = new THREE.Mesh(geometry, material)
          scene.add(sphere)
        }

        // Animation loop
        const animate = () => {
          if (!mounted) return

          animationId = requestAnimationFrame(animate)

          if (controls) controls.update()
          if (renderer && scene && camera) {
            renderer.render(scene, camera)
          }
        }

        setStatus('Starting render...')
        animate()
        setStatus('Ready!')
      } catch (err: any) {
        console.error('Brain viewer error:', err)
        if (mounted) {
          setError(err.message)
          setStatus('Failed')
        }
      }
    }

    // Start with delay
    const timer = setTimeout(init3D, 100)

    return () => {
      mounted = false
      clearTimeout(timer)

      if (animationId) {
        cancelAnimationFrame(animationId)
      }

      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      if (renderer) {
        renderer.dispose()
      }

      if (scene) {
        scene.clear()
      }
    }
  }, [
    leftHemisphere,
    rightHemisphere,
    showLeftHemi,
    showRightHemi,
    transparency,
    wireframe,
    selectedRegions,
  ])

  if (error) {
    return (
      <div
        className={cn(
          'flex h-full min-h-[600px] w-full items-center justify-center bg-red-900',
          className
        )}
      >
        <div className="text-center text-white">
          <p className="text-lg font-semibold">Brain Viewer Error</p>
          <p className="mt-2 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      {status !== 'Ready!' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
            <p className="text-sm">{status}</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}
