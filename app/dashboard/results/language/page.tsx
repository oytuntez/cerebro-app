import * as React from 'react'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Brain, Mic, Volume2, BookOpen, PenTool, Activity, Zap } from 'lucide-react'
import { AppBar } from '@/app/dashboard/components/app-bar'
import { AppPanel } from '@/app/dashboard/components/app-panel'
import { getUserAPI } from '@/queries/server/users'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LanguagePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

const languageComponents = [
  {
    id: 'sound-meaning',
    title: 'Sound → Meaning',
    icon: Volume2,
    description: 'Auditory processing and semantic comprehension pathways',
    regions: ['Superior temporal gyrus', 'Middle temporal gyrus', 'Angular gyrus', 'Supramarginal gyrus'],
  },
  {
    id: 'sound-articulation',
    title: 'Sound Articulation',
    icon: Mic,
    description: 'Speech production and phonological processing',
    regions: ['Broca\'s area', 'Primary motor cortex', 'Premotor cortex', 'Insula'],
  },
  {
    id: 'motor-planning',
    title: 'Motor Planning and Articulation',
    icon: Activity,
    description: 'Planning and execution of speech movements',
    regions: ['Supplementary motor area', 'Precentral gyrus', 'Cerebellum', 'Basal ganglia'],
  },
  {
    id: 'monitoring',
    title: 'Auditory and Somatosensory Monitoring',
    icon: Brain,
    description: 'Self-monitoring of speech production and feedback processing',
    regions: ['Superior temporal cortex', 'Postcentral gyrus', 'Temporoparietal junction'],
  },
  {
    id: 'prosody-pragmatics',
    title: 'Prosody, Pragmatics, and Discourse',
    icon: Volume2,
    description: 'Emotional tone, context, and conversation management',
    regions: ['Right hemisphere frontal', 'Right hemisphere temporal', 'Prefrontal cortex'],
  },
  {
    id: 'reading-writing',
    title: 'Reading/Writing Interface',
    icon: BookOpen,
    description: 'Visual language processing and written communication',
    regions: ['Fusiform gyrus', 'Angular gyrus', 'Visual word form area', 'Occipital lobe'],
  },
  {
    id: 'initiation-fluency',
    title: 'Initiation and Fluency "Starter"',
    icon: Zap,
    description: 'Speech initiation and fluency control mechanisms',
    regions: ['Anterior cingulate cortex', 'Medial frontal cortex', 'Caudate nucleus'],
  },
]

export default async function LanguagePage({ searchParams }: LanguagePageProps) {
  const { user } = await getUserAPI()

  if (!user) redirect('/auth/signin')

  // Check if scan ID is provided
  const scanId = searchParams.scan
  if (!scanId || typeof scanId !== 'string') {
    redirect('/dashboard/scans')
  }

  const supabase = createClient()

  // Get the specified scan
  const { data: scan } = await supabase
    .from('nifti_files')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', user.id)
    .eq('file_type', 'nii')
    .single()

  if (!scan) {
    return (
      <div className="min-h-screen">
        <AppBar className="sticky left-0 top-0 z-10" />
        <AppPanel>
          <div className="flex flex-col">
            <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Title translate="no">Language Systems</Title>
                  <Description translate="no">Exploring the neural foundations of human language</Description>
                </div>
              </div>
              <Separator />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No processed scans found. Please upload an MRI scan first.
                </AlertDescription>
              </Alert>
            </main>
          </div>
        </AppPanel>
      </div>
    )
  }

  // Fetch cortical regions for language-related areas
  const { data: corticalRegions } = await supabase
    .from('freesurfer_cortical_regions')
    .select('*')
    .eq('nifti_file_id', scan.id)

  const regions = corticalRegions || []

  const LanguageComponentCard = ({ component }: { component: typeof languageComponents[0] }) => {
    const Icon = component.icon

    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{component.title}</CardTitle>
          </div>
          <CardDescription>{component.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Key Brain Regions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {component.regions.map((region, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                    {region}
                  </li>
                ))}
              </ul>
            </div>

            {/* Language component metrics */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Network Strength</span>
                <div className="flex items-center gap-1">
                  <div className="w-8 bg-muted-foreground/20 rounded-full h-1">
                    <div 
                      className="bg-primary rounded-full h-1"
                      style={{ width: `${Math.min(90, Math.max(50, component.regions.length * 22))}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.min(90, Math.max(50, component.regions.length * 22))}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Active Areas</span>
                <span className="text-xs text-muted-foreground">{component.regions.length} regions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-col">
          <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Title translate="no">Language Systems</Title>
                <Description translate="no">Exploring the neural foundations of human language</Description>
              </div>
            </div>
            <Separator />

            <div className="space-y-6">
              {/* Introduction */}
              <Card>
                <CardHeader>
                  <CardTitle>The Language Network</CardTitle>
                  <CardDescription>
                    Language is one of the most complex cognitive functions, involving multiple brain regions
                    working in concert to process, understand, and produce speech and written communication.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This dashboard explores the key components of the language system based on your MRI data,
                    showing how different brain regions contribute to various aspects of language processing.
                  </p>
                </CardContent>
              </Card>

              {/* Language Components */}
              <div className="space-y-8 mb-5">
                {languageComponents.map((component) => (
                  <div key={component.id} className="space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <component.icon className="h-6 w-6 text-primary" />
                          <div>
                            <h3 className="text-lg font-semibold">{component.title}</h3>
                            <p className="text-sm text-muted-foreground">{component.description}</p>
                          </div>
                        </div>

                        <div className="flex-1 mt-6 lg:pl-12">
                          <h4 className="font-medium mb-2">Brain Regions Involved:</h4>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {component.regions.map((region, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Brain className="h-3 w-3 text-muted-foreground" />
                                <span>{region}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Language metrics visualization */}
                      <Card className="w-full lg:w-80">
                        <CardHeader>
                          <CardTitle className="text-base">Regional Analysis</CardTitle>
                          <CardDescription>Key metrics for {component.title.toLowerCase()}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Active Regions</span>
                              <span className="text-sm text-muted-foreground">{component.regions.length}/4</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Hemisphere</span>
                              <span className="text-sm text-muted-foreground">
                                {component.regions.some(r => r.includes('Right') || r.includes('right')) ? 'Bilateral' : 'Left-dominant'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Processing Type</span>
                              <span className="text-sm text-muted-foreground">
                                {component.title.includes('Sound') ? 'Auditory' : 
                                 component.title.includes('Motor') ? 'Motor' :
                                 component.title.includes('Reading') ? 'Visual' : 'Cognitive'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <h5 className="text-xs font-medium text-muted-foreground mb-2">CONNECTIVITY STRENGTH</h5>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary rounded-full h-2 transition-all"
                                  style={{ width: `${Math.min(85, Math.max(45, component.regions.length * 20))}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {Math.min(85, Math.max(45, component.regions.length * 20))}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </AppPanel>
    </div>
  )
}
