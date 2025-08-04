'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Mic, Volume2, BookOpen, Activity, Zap, ChevronUp } from 'lucide-react'
import BrainViewerWrapper from '@/components/brain-visualization/BrainViewerWrapper'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const languageComponents = [
  {
    id: 'sound-meaning',
    title: 'Sound → Meaning',
    icon: Volume2,
    description: 'Auditory processing and semantic comprehension pathways',
    regions: ['Superior temporal gyrus', 'Middle temporal gyrus', 'Angular gyrus', 'Supramarginal gyrus'],
    angle: 315, // Top-left
    volume: 8247, // mm³
    percentage: 112, // % of average
  },
  {
    id: 'sound-articulation',
    title: 'Sound Articulation',
    icon: Mic,
    description: 'Speech production and phonological processing',
    regions: ['Broca\'s area', 'Primary motor cortex', 'Premotor cortex', 'Insula'],
    angle: 45, // Top-right
    volume: 6891,
    percentage: 98,
  },
  {
    id: 'motor-planning',
    title: 'Motor Planning',
    icon: Activity,
    description: 'Planning and execution of speech movements',
    regions: ['Supplementary motor area', 'Precentral gyrus', 'Cerebellum'],
    angle: 270, // Left
    volume: 7523,
    percentage: 105,
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    icon: Brain,
    description: 'Self-monitoring and feedback processing',
    regions: ['Superior temporal cortex', 'Postcentral gyrus', 'Temporoparietal junction'],
    angle: 90, // Right
    volume: 5642,
    percentage: 89,
  },
  {
    id: 'reading-writing',
    title: 'Reading/Writing',
    icon: BookOpen,
    description: 'Visual language processing',
    regions: ['Fusiform gyrus', 'Visual word form area', 'Occipital lobe'],
    angle: 225, // Bottom-left
    volume: 4918,
    percentage: 93,
  },
  {
    id: 'initiation-fluency',
    title: 'Fluency',
    icon: Zap,
    description: 'Speech initiation and fluency control',
    regions: ['Anterior cingulate cortex', 'Medial frontal cortex', 'Caudate nucleus'],
    angle: 135, // Bottom-right
    volume: 3764,
    percentage: 107,
  },
]

export default function LanguagePageClient() {
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  return (
    <>
      {/* Brain Model with Circular Cards */}
      <div className="relative w-full flex items-center justify-center" style={{ height: '800px' }}>
        <div className="relative w-[700px] h-[700px]">
          {/* Brain Model in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[400px] h-[400px] z-10 rounded-full overflow-hidden bg-background/50 backdrop-blur-sm shadow-2xl">
              <BrainViewerWrapper 
                showLeftHemi={true}
                showRightHemi={true}
                transparency={0.9}
                wireframe={false}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Cards in Circular Pattern */}
          {languageComponents.map((component) => {
            const Icon = component.icon
            const radius = 320 // Distance from center
            const angleRad = (component.angle * Math.PI) / 180
            const x = Math.cos(angleRad) * radius
            const y = Math.sin(angleRad) * radius

            return (
              <div
                key={component.id}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <Card className="w-56 bg-background/95 backdrop-blur cursor-pointer transition-all hover:bg-secondary/20 hover:shadow-lg hover:scale-105">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">{component.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-3">
                    <p className="text-xs text-muted-foreground">{component.description}</p>
                    
                    {/* Volume and Percentage Data */}
                    <div className="bg-muted/30 rounded-lg p-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">Volume</span>
                        <span className="text-xs text-primary font-mono">{component.volume.toLocaleString()} mm³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">vs Average</span>
                        <span className={`text-xs font-mono ${
                          component.percentage > 100 ? 'text-green-600' : 
                          component.percentage < 95 ? 'text-orange-600' : 
                          'text-muted-foreground'
                        }`}>
                          {component.percentage}%
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => scrollToSection(component.id)}
                    >
                      Explore Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-16 mt-16">
        {languageComponents.map((component) => {
          const Icon = component.icon
          
          return (
            <section key={component.id} id={component.id} className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">{component.title}</CardTitle>
                      <CardDescription className="text-base">{component.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-3">Key Brain Regions</h3>
                      <ul className="space-y-2">
                        {component.regions.map((region, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Brain className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{region}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Clinical Significance</h3>
                      <p className="text-sm text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Damage to these regions 
                        can result in various language deficits. Understanding the neural basis of 
                        {' ' + component.title.toLowerCase()} helps in diagnosis and treatment planning.
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="font-semibold mb-3">Detailed Analysis</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p>
                        The {component.title.toLowerCase()} system plays a crucial role in human language 
                        processing. This network involves multiple brain regions working in concert to 
                        enable complex linguistic functions.
                      </p>
                      <p className="mt-3">
                        Research has shown that these regions are highly interconnected, forming a 
                        distributed network that processes information in parallel. Functional imaging 
                        studies have revealed activation patterns that vary depending on the specific 
                        linguistic task being performed.
                      </p>
                      <p className="mt-3">
                        Individual variations in brain structure and function can lead to differences 
                        in language abilities. Understanding these variations is important for 
                        personalized approaches to language learning and rehabilitation.
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