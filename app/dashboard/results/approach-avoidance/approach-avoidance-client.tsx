'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Target, Shield, Scale, Settings, AlertTriangle, ChevronUp } from 'lucide-react'
import BrainViewerWrapper from '@/components/brain-visualization/BrainViewerWrapper'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const approachAvoidanceSystems = [
  {
    id: 'approach-reward',
    title: 'Approach Systems',
    icon: Target,
    description: 'Core mesolimbic reward/go circuits',
    angle: 315, // Top-left
    color: 'red',
    segments: [
      {
        id: 'vta-nac',
        name: 'VTA → NAc Circuit',
        volume: 3247,
        percentage: 105,
        description: 'Dopaminergic projections encoding motivational "wanting" and incentive salience'
      },
      {
        id: 'ofc-vmpfc',
        name: 'OFC/vmPFC',
        volume: 8543,
        percentage: 112,
        description: 'Subjective value representation and outcome prediction'
      },
      {
        id: 'effort-control',
        name: 'Effort Control',
        volume: 4891,
        percentage: 98,
        description: 'NAc dopamine biasing effort-based decision-making'
      },
      {
        id: 'bla-appetitive',
        name: 'Appetitive BLA',
        volume: 2156,
        percentage: 94,
        description: 'Basolateral amygdala appetitive processing channels'
      },
      {
        id: 'striatal-targets',
        name: 'Striatal Targets',
        volume: 6734,
        percentage: 108,
        description: 'Distinct striatal subregions receiving VTA projections'
      }
    ]
  },
  {
    id: 'avoidance-threat',
    title: 'Avoidance Systems',
    icon: Shield,
    description: 'Threat detection and no-go circuits',
    angle: 45, // Top-right
    color: 'blue',
    segments: [
      {
        id: 'cea-phasic',
        name: 'CeA (Phasic)',
        volume: 1987,
        percentage: 89,
        description: 'Central amygdala mediating short-duration defensive responses'
      },
      {
        id: 'bnst-sustained',
        name: 'BNST (Sustained)',
        volume: 2341,
        percentage: 103,
        description: 'Sustained threat and unpredictable anxiety responses'
      },
      {
        id: 'hypothalamus-pag',
        name: 'Hypothalamus/PAG',
        volume: 4567,
        percentage: 96,
        description: 'Autonomic and motor defense program orchestration'
      }
    ]
  },
  {
    id: 'conflict-bis',
    title: 'Conflict System',
    icon: Scale,
    description: 'Hippocampal-septal BIS conflict detection',
    angle: 270, // Left
    color: 'yellow',
    segments: [
      {
        id: 'hippocampus-conflict',
        name: 'Hippocampus',
        volume: 7234,
        percentage: 107,
        description: 'Goal conflict detection and behavioral inhibition'
      },
      {
        id: 'septal-bis',
        name: 'Septal BIS',
        volume: 3456,
        percentage: 91,
        description: 'Septo-hippocampal circuitry for conflict resolution'
      },
      {
        id: 'ventral-hpc',
        name: 'Ventral HPC',
        volume: 2987,
        percentage: 99,
        description: 'Anterior hippocampal sectors mediating approach-avoidance arbitration'
      },
      {
        id: 'cortico-striatal',
        name: 'Cortico-striatal',
        volume: 8765,
        percentage: 115,
        description: 'Coupling with mesolimbic loops for balance control'
      }
    ]
  },
  {
    id: 'control-selection',
    title: 'Control Systems',
    icon: Settings,
    description: 'ACC-PFC executive control allocation',
    angle: 90, // Right
    color: 'purple',
    segments: [
      {
        id: 'dacc-monitoring',
        name: 'dACC Monitor',
        volume: 5432,
        percentage: 102,
        description: 'Dorsal ACC monitoring processing conflict and control demand'
      },
      {
        id: 'pfc-allocation',
        name: 'PFC Allocation',
        volume: 9876,
        percentage: 109,
        description: 'Prefrontal cortex allocating cognitive control resources'
      },
      {
        id: 'evc-system',
        name: 'EVC System',
        volume: 4321,
        percentage: 88,
        description: 'Expected Value of Control cost-benefit analysis'
      }
    ]
  },
  {
    id: 'integration-hub',
    title: 'Integration Hub',
    icon: Brain,
    description: 'Valuation and executive integration',
    angle: 225, // Bottom-left
    color: 'orange',
    segments: [
      {
        id: 'valuation-drive',
        name: 'Valuation & Drive',
        volume: 6789,
        percentage: 104,
        description: 'OFC/vmPFC and BLA value assignment with VTA→NAc drive conversion'
      },
      {
        id: 'threat-gating',
        name: 'Threat Gating',
        volume: 3210,
        percentage: 92,
        description: 'CeA/BNST threat timescale appraisal and avoidance bias'
      },
      {
        id: 'executive-allocation',
        name: 'Executive Control',
        volume: 7654,
        percentage: 111,
        description: 'dACC-PFC conflict monitoring and control deployment'
      }
    ]
  },
  {
    id: 'clinical-markers',
    title: 'Clinical Markers',
    icon: AlertTriangle,
    description: 'Disorder-relevant circuit patterns',
    angle: 135, // Bottom-right
    color: 'teal',
    segments: [
      {
        id: 'anxiety-patterns',
        name: 'Anxiety Patterns',
        volume: 4567,
        percentage: 87,
        description: 'Overweighted BNST/uncertainty and hippocampal conflict sensitivity'
      },
      {
        id: 'depression-apathy',
        name: 'Depression/Apathy',
        volume: 2345,
        percentage: 79,
        description: 'NAc dopamine and effort valuation deficits'
      },
      {
        id: 'addiction-markers',
        name: 'Addiction Risk',
        volume: 5678,
        percentage: 126,
        description: 'Incentive-sensitization of mesolimbic wanting systems'
      },
      {
        id: 'cognitive-control',
        name: 'Cognitive Control',
        volume: 3987,
        percentage: 95,
        description: 'ACC-PFC control allocation efficiency'
      },
      {
        id: 'threat-sensitivity',
        name: 'Threat Sensitivity',
        volume: 2876,
        percentage: 113,
        description: 'Amygdala-BNST threat detection calibration'
      }
    ]
  }
]

// Color palettes for each system
const colorPalettes = {
  orange: ['#ffcccc', '#ff9999', '#ff6666', '#ff3333', '#cc0000'],
  blue: ['#b8e066', '#93c233', '#6da300', '#578200', '#416200'],
  yellow: ['#a684d9', '#8159b3', '#5d2e8c', '#4a256f', '#361b52'],
  purple: ['#9999ff', '#6666ff', '#0000ff', '#0000cc', '#000099'], // Shades of #0000FF (Blue)
  red: ['#ffd699', '#ffc266', '#ffa500', '#cc8400', '#996300'], // Shades of #FFA500 (Orange)
  teal: ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669']
}

interface DonutSegment {
  id: string
  name: string
  volume: number
  percentage: number
  description: string
}

interface DonutChartProps {
  system: typeof approachAvoidanceSystems[0]
  onSegmentHover: (segment: DonutSegment | null) => void
  onSegmentClick: (segment: DonutSegment) => void
  hoveredSegment: DonutSegment | null
  selectedSegments: DonutSegment[]
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  system, 
  onSegmentHover, 
  onSegmentClick, 
  hoveredSegment, 
  selectedSegments 
}) => {
  const total = system.segments.length
  const radius = 55      // 80% of 69
  const innerRadius = 32 // 80% of 40
  const centerX = 74     // 80% of 92
  const centerY = 74     // 80% of 92
  
  const colors = colorPalettes[system.color as keyof typeof colorPalettes]

  const getInitials = (name: string) => {
    return name.match(/\b(\w)/g)?.join('').toUpperCase() ?? ''
  }

  const createArcPath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const start = polarToCartesian(centerX, centerY, outerR, endAngle)
    const end = polarToCartesian(centerX, centerY, outerR, startAngle)
    const innerStart = polarToCartesian(centerX, centerY, innerR, endAngle)
    const innerEnd = polarToCartesian(centerX, centerY, innerR, startAngle)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    
    return [
      'M', start.x, start.y,
      'A', outerR, outerR, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ')
  }

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  return (
    <div className="relative">
      <svg width="148" height="148" className="drop-shadow-sm">
        {system.segments.map((segment, index) => {
          const startAngle = (index * 360) / total
          const endAngle = ((index + 1) * 360) / total
          const isHovered = hoveredSegment?.id === segment.id
          const isSelected = selectedSegments.some(s => s.id === segment.id)
          
          // Determine border color based on percentage - only yellow for above average
          const getBorderColor = () => {
            if (segment.percentage > 100) return 'white' // Above average
            return 'grey' // Below or at average
          }
          
          return (
            <TooltipProvider key={segment.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <path
                    d={createArcPath(startAngle, endAngle, innerRadius, radius)}
                    fill={colors[index % colors.length]}
                    stroke={getBorderColor()}
                    strokeWidth="3"
                    className={`cursor-pointer transition-all duration-200 ${
                      isHovered || isSelected ? 'opacity-100 drop-shadow-lg' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      filter: isHovered || isSelected ? 'brightness(1.1)' : undefined,
                      transform: isHovered || isSelected ? 'scale(1.05)' : undefined,
                      transformOrigin: `${centerX}px ${centerY}px`
                    }}
                    onMouseEnter={() => onSegmentHover(segment)}
                    onMouseLeave={() => onSegmentHover(null)}
                    onClick={() => onSegmentClick(segment)}
                    onTouchStart={() => onSegmentHover(segment)}
                    onTouchEnd={() => onSegmentHover(null)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{segment.name}</p>
                  <p className="text-xs text-muted-foreground">{segment.percentage}% of average</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
        
        {/* Segment names for hovered/selected segments */}
        {system.segments.map((segment, index) => {
          const isHovered = hoveredSegment?.id === segment.id
          const isSelected = selectedSegments.some(s => s.id === segment.id)
          
          if (!isHovered && !isSelected) return null
          
          const startAngle = (index * 360) / total
          const endAngle = ((index + 1) * 360) / total
          const midAngle = (startAngle + endAngle) / 2
          const textRadius = (radius + innerRadius) / 2
          const textAngle = (midAngle - 90) * Math.PI / 180
          const textX = centerX + Math.cos(textAngle) * textRadius
          const textY = centerY + Math.sin(textAngle) * textRadius
          
          return (
            <text
              key={`text-${segment.id}`}
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-xs font-medium pointer-events-none"
              style={{
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
              }}
            >
              {getInitials(segment.name)}
            </text>
          )
        })}
      </svg>
      
      {/* Center title */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <system.icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  )
}

export default function ApproachAvoidanceClient() {
  const [showScrollTop, setShowScrollTop] = React.useState(false)
  const [hoveredSegment, setHoveredSegment] = React.useState<DonutSegment | null>(null)
  const [selectedSegments, setSelectedSegments] = React.useState<DonutSegment[]>([])
  const [hoveredSystem, setHoveredSystem] = React.useState<string | null>(null)
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    handleResize() // Initial check
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSegmentHover = (segment: DonutSegment | null, systemId?: string) => {
    setHoveredSegment(segment)
    setHoveredSystem(systemId || null)
  }

  const handleSegmentClick = (segment: DonutSegment, systemId: string) => {
    setSelectedSegments(prev => {
      const isAlreadySelected = prev.some(s => s.id === segment.id)
      if (isAlreadySelected) {
        // Remove from selection
        return prev.filter(s => s.id !== segment.id)
      } else {
        // Add to selection
        return [segment, ...prev]
      }
    })
    setHoveredSystem(systemId)
  }

  // Get the current active segment and its system (prioritize hovered, fallback to first selected)
  const activeSegment = hoveredSegment || (selectedSegments.length > 0 ? selectedSegments[0] : null)
  const activeSystem = activeSegment ? approachAvoidanceSystems.find(sys => 
    sys.segments.some(seg => seg.id === activeSegment.id)
  ) : null

  return (
    <>
      {/* Main Layout with Left Brain Area and Right Panel */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[800px]">
        {/* Left Area - Brain Model with Circular Donut Charts */}
        <div className="flex-1 relative flex items-center justify-center px-4">
          <div className="relative w-full max-w-[700px] aspect-square">
          {/* Brain Model in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] z-10 rounded-full overflow-hidden bg-background/50 backdrop-blur-sm shadow-2xl">
              <BrainViewerWrapper 
                showLeftHemi={true}
                showRightHemi={true}
                transparency={0.9}
                wireframe={false}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Donut Charts in Circular Pattern */}
          {approachAvoidanceSystems.map((system, index) => {
            // Equal distribution around circle
            const angle = (index * 360) / approachAvoidanceSystems.length
            const radius = screenSize === 'mobile' ? 180 : screenSize === 'tablet' ? 240 : 300 // Adjusted for larger donuts
            const angleRad = (angle * Math.PI) / 180
            const x = Math.cos(angleRad) * radius
            const y = Math.sin(angleRad) * radius

            // Determine text alignment based on angle
            const isTextOnLeft = angle > 90 && angle < 270
            const textPositionClasses = isTextOnLeft
              ? 'right-full mr-2 text-right'
              : 'left-full ml-2 text-left'

            return (
              <div
                key={system.id}
                className="absolute transition-all duration-300"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <div className="relative flex justify-center">
                  <DonutChart
                    system={system}
                    onSegmentHover={(segment) => handleSegmentHover(segment, system.id)}
                    onSegmentClick={(segment) => handleSegmentClick(segment, system.id)}
                    hoveredSegment={hoveredSegment}
                    selectedSegments={selectedSegments}
                  />
                  <div className={`absolute top-0 w-44 ${textPositionClasses}`}>
                    <h3 className="font-semibold text-sm leading-tight">{system.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{system.description}</p>
                  </div>
                </div>
              </div>
            )
          })}

          </div>
        </div>

        {/* Right Panel - Accumulated Segment Information */}
        <div className="w-full lg:w-80 bg-background lg:border-l border-t lg:border-t-0 border-border flex flex-col h-[600px] lg:h-[800px]">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Selected Regions</h3>
              {selectedSegments.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSegments([])
                    setHoveredSegment(null)
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedSegments.length > 0 
                ? `${selectedSegments.length} region${selectedSegments.length > 1 ? 's' : ''} selected`
                : 'Click on donut segments to view details'
              }
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedSegments.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8 text-center">
                <div>
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select donut segments to view detailed information about neural regions
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {selectedSegments.map((segment) => {
                  const system = approachAvoidanceSystems.find(sys => 
                    sys.segments.some(seg => seg.id === segment.id)
                  )
                  if (!system) return null

                  const segmentIndex = system.segments.findIndex(s => s.id === segment.id)
                  const segmentColor = segmentIndex !== -1 
                    ? colorPalettes[system.color as keyof typeof colorPalettes][segmentIndex % colorPalettes[system.color as keyof typeof colorPalettes].length]
                    : '#ccc' // Fallback color

                  return (
                    <Card key={segment.id} className="bg-muted/20 overflow-hidden">
                      <div className="h-2" style={{ backgroundColor: segmentColor }} />
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ 
                              backgroundColor: segmentColor
                            }}
                          />
                          <CardTitle className="text-sm">{segment.name}</CardTitle>
                        </div>
                        <CardDescription className="text-xs">{system.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 p-4 pt-0">
                        <p className="text-xs text-muted-foreground">
                          {segment.description}
                        </p>
                        
                        {/* Volume and Comparison Data */}
                        <div className="bg-background/50 rounded-lg p-2 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">Volume</span>
                            <span className="text-xs text-primary font-mono font-bold">
                              {segment.volume.toLocaleString()} mm³
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">vs Average</span>
                            <span className={`text-xs font-mono font-bold ${
                              segment.percentage > 100 ? 'text-green-600' : 
                              segment.percentage < 95 ? 'text-orange-600' : 
                              'text-muted-foreground'
                            }`}>
                              {segment.percentage}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="flex-1 text-xs h-7"
                            onClick={() => scrollToSection(system.id)}
                          >
                            Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs h-7 px-2"
                            onClick={() => {
                              setSelectedSegments(prev => prev.filter(s => s.id !== segment.id))
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-16 mt-16">
        {approachAvoidanceSystems.map((system) => {
          const Icon = system.icon
          
          return (
            <section key={system.id} id={system.id} className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">{system.title}</CardTitle>
                      <CardDescription className="text-base">{system.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-3">Key Components</h3>
                      <ul className="space-y-2">
                        {system.segments.map((segment, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div 
                              className="h-4 w-4 rounded-full mt-0.5" 
                              style={{ 
                                backgroundColor: colorPalettes[system.color as keyof typeof colorPalettes][idx % colorPalettes[system.color as keyof typeof colorPalettes].length] 
                              }}
                            />
                            <div>
                              <span className="text-sm font-medium">{segment.name}</span>
                              <p className="text-xs text-muted-foreground">{segment.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Clinical Relevance</h3>
                      <p className="text-sm text-muted-foreground">
                        This system plays a crucial role in approach-avoidance decision making and is implicated 
                        in various psychiatric conditions. Understanding individual variations helps in 
                        personalized treatment approaches and behavioral interventions.
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="font-semibold mb-3">System Integration</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p>
                        The {system.title.toLowerCase()} integrates with other neural circuits to form 
                        a comprehensive decision-making network. This system's connectivity patterns 
                        determine how approach and avoidance behaviors are balanced in real-world situations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )
        })}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all hover:scale-110"
          size="icon"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}