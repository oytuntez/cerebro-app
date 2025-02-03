import * as React from 'react'

import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Footer } from '@/components/footer'

import { absoluteUrl } from '@/lib/utils'
import Link from 'next/link'
import { Activity, Brain, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

export default function RootPage() {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative">
          {/* Background image */}
          <div className="absolute inset-y-0 -right-[100px]">
            <div className="relative">
              <Image
                src="/assets/images/main/tracts.png"
                alt="Brain tractography visualization"
                width={800}
                height={800}
                priority
                quality={100}
              />
            </div>
          </div>
          
          {/* Content with gradient overlay just for text area */}
          <div className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="relative">
                {/* Gradient overlay just for text area */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
                
                {/* Content */}
                <div className="relative">
                  <h1 className="mt-6 text-6xl/tight font-bold text-black">
                    Know Your Brain.
                    <span className="block mt-2">Own Your Story.</span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-800 leading-relaxed">
                    <span className="inline bg-white/95 px-4 py-1 box-decoration-clone">Your brain holds patterns as unique as your fingerprint.</span><br />
                    <span className="inline bg-white/95 px-4 py-1 box-decoration-clone">Through advanced MRI analysis, we reveal the intricate networks that</span><br />
                    <span className="inline bg-white/95 px-4 py-1 box-decoration-clone">shape your memory, drive your creativity, and define your emotional</span><br />
                    <span className="inline bg-white/95 px-4 py-1 box-decoration-clone">intelligence – turning neuroscience into self-understanding.</span>
                  </p>
                  <div className="mt-8 flex justify-center gap-4">
                    <Button
                      size="lg"
                      className="bg-black text-white hover:bg-black/90"
                    >
                      Begin Your Discovery
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-black text-black hover:bg-black/5"
                    >
                      Learn more about the science
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 flex justify-center gap-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">18+</div>
                  <div className="text-sm text-gray-600">Cognitive Domains</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">100%</div>
                  <div className="text-sm text-gray-600">Personalized</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">24/7</div>
                  <div className="text-sm text-gray-600">Expert Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Science of You Section */}
        <section id="your-brain" className="relative bg-white px-4 py-20 sm:px-6 lg:px-8">
          {/* Tractography image */}
          <div className="absolute left-[5%] -top-[200px] h-full">
            <Image
                src="/assets/images/main/tracts3.png"
                alt="Brain tractography visualization"
                width={400}
                height={800}
                priority
                quality={100}
                className="opacity-90 -rotate-[45deg]"
              />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: 'Cognitive Blueprint',
                  description:
                    'Understanding your memory patterns, emotional processing, and problem-solving approaches',
                },
                {
                  icon: Activity,
                  title: 'Neural Networks',
                  description:
                    'Mapping the connections that make your thinking and behavior unique',
                },
                {
                  icon: Sparkles,
                  title: 'Personal Insights',
                  description:
                    'Translating complex brain data into meaningful personal understanding',
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-black/5">
                    <feature.icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-black">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Scientific Foundation Section */}
        <section id="science" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <Badge className="bg-black/5 text-black hover:bg-black/10">
                  Scientific Foundation
                </Badge>
                <h2 className="text-4xl font-bold text-[#332B2C]">
                  Every insight is backed by advanced neurological research
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: 'Research Backed',
                      description:
                        'Built on decades of neuroscience research and peer-reviewed studies',
                    },
                    {
                      title: 'Expert Validated',
                      description:
                        'Analysis methods developed and verified by leading neurologists',
                    },
                    {
                      title: 'Precision Analysis',
                      description:
                        'Advanced MRI processing using validated scientific frameworks',
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="mt-1">
                        <Check className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-semibold text-[#332B2C]">
                          {item.title}
                        </h3>
                        <p className="text-[#745656]">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/assets/images/main/13360_2024_5357_Fig2_HTML.png"
                  alt="Scientific research visualization"
                  width={500}
                  height={600}
                  className="rounded-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Actionable Insights Section */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold text-black">
                Actionable Insights
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
                Understanding your brain isn't just about data – it's about possibilities. 
                Transform insights into meaningful actions with expert guidance.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="p-6 transition-shadow hover:shadow-lg">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
                  <Brain className="h-6 w-6 text-black" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-black">
                  Personal Growth
                </h3>
                <p className="text-gray-600">
                  Tailored recommendations based on your cognitive profile
                </p>
              </Card>
              <Card className="p-6 transition-shadow hover:shadow-lg">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-black">
                  Expert Support
                </h3>
                <p className="text-gray-600">
                  Connect with specialists to understand and apply your insights
                </p>
              </Card>
              <Card className="p-6 transition-shadow hover:shadow-lg">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
                  <Check className="h-6 w-6 text-black" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-black">
                  Practical Steps
                </h3>
                <p className="text-gray-600">
                  Clear guidance on applying insights to your daily life
                </p>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black/5"
              >
                View example insights
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-20 text-4xl font-bold text-center text-[#332B2C]">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* MRI Scan */}
              <Card className="p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
                    <span className="text-2xl font-bold text-black">01</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#332B2C]">MRI Scan</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Premium Brain Imaging</h4>
                    <p className="text-[#745656] leading-relaxed">
                      Experience a seamless MRI session or upload your existing brain MRI data.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Partner Network</h5>
                      <p className="text-sm text-[#745656]">
                        Premium facilities for exceptional care
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Existing Data</h5>
                      <p className="text-sm text-[#745656]">
                        Simple upload for current MRI scans
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Analysis */}
              <Card className="p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
                    <span className="text-2xl font-bold text-black">02</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#332B2C]">Analysis</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Advanced Analysis</h4>
                    <p className="text-[#745656] leading-relaxed">
                      Our platform processes your MRI data through multiple scientific frameworks, analyzing 18 distinct cognitive domains.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Memory & Attention</h5>
                      <p className="text-sm text-[#745656]">
                        Comprehensive analysis of cognitive functions
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Emotional Intelligence</h5>
                      <p className="text-sm text-[#745656]">
                        Processing of emotional and social cognition
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Creative Thinking</h5>
                      <p className="text-sm text-[#745656]">
                        Innovation and problem-solving patterns
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Discovery */}
              <Card className="p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
                    <span className="text-2xl font-bold text-black">03</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#332B2C]">Discovery</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Your Cognitive Profile</h4>
                    <p className="text-[#745656] leading-relaxed">
                      Access your comprehensive brain insights through our intuitive platform, with clear visualizations and detailed explanations.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">18 Cognitive Domains</h5>
                      <p className="text-sm text-[#745656]">
                        Complete analysis across all key cognitive areas
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">3D and Interactive Visualizations</h5>
                      <p className="text-sm text-[#745656]">
                        Explore your brain data through intuitive interfaces
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">100% Personalized</h5>
                      <p className="text-sm text-[#745656]">
                        Insights tailored to your unique cognitive profile
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Guidance */}
              <Card className="p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
                    <span className="text-2xl font-bold text-black">04</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#332B2C]">Guidance</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Connect with Specialists</h4>
                    <p className="text-[#745656] leading-relaxed">
                      Connect with our network of neurology specialists for personalized consultations and deeper understanding of your cognitive profile.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Professional Network</h5>
                      <p className="text-sm text-[#745656]">
                        Access to qualified neurological experts
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Personalized Sessions</h5>
                      <p className="text-sm text-[#745656]">
                        One-on-one consultations for deeper insights
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-black/10 pl-6">
                      <h5 className="font-medium text-[#332B2C] mb-2">Ongoing Support</h5>
                      <p className="text-sm text-[#745656]">
                        Continuous guidance for your journey
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Deep-Dive Features Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-4xl font-bold text-center text-black">
              Deep-Dive Features
            </h2>
            
            <div className="space-y-16">
              {/* Interactive Display 1: Insight Categories */}
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-4 lg:pr-8 lg:max-w-xl">
                  <h3 className="text-3xl font-semibold text-black">18 Dimensions of You</h3>
                  <p className="text-xl text-gray-600">
                    From emotional intelligence to problem-solving patterns, explore
                    the full spectrum of your cognitive landscape through our
                    comprehensive analysis platform.
                  </p>
                </div>
                <div className="relative w-full max-w-md mx-auto lg:max-w-none">
                  <Image
                    src="/assets/images/main/tracts4.png"
                    alt="18 Dimensions of You"
                    priority
                    width={500}
                    height={500}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              {/* Interactive Display 2: Visualization Tools */}
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="order-2 lg:order-1 relative w-full max-w-md mx-auto lg:max-w-none">
                  <Image
                    src="/assets/images/main/article_river_49e697a082e511e7943d4bb808c3a6e4-Cureus-Figure-1.png"
                    alt="Intuitive Understanding"
                    priority
                    width={500}
                    height={500}
                    className="rounded-2xl"
                  />
                </div>
                <div className="order-1 lg:order-2 space-y-4 lg:pl-8 lg:max-w-xl">
                  <h3 className="text-3xl font-semibold text-black">Intuitive Understanding</h3>
                  <p className="text-xl text-gray-600">
                    See your cognitive patterns through elegant, interactive visualizations 
                    designed to make complex data intuitive and meaningful.
                  </p>
                </div>
              </div>

              {/* Interactive Display 3: Expert Analysis */}
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-4 lg:pr-8 lg:max-w-xl">
                  <h3 className="text-3xl font-semibold text-black">Professional Perspective</h3>
                  <p className="text-xl text-gray-600">
                    Access detailed analysis of your results with clear explanations 
                    and context for each insight.
                  </p>
                </div>
                <div className="relative w-full max-w-md mx-auto lg:max-w-none">
                  <Image
                    src="/assets/images/main/a-neurologist-looking-at-a-brain-scan.jpg"
                    alt="Professional Perspective"
                    priority
                    width={500}
                    height={500}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-20 text-4xl font-bold text-center text-black">
              Use Cases
            </h2>
            
            <div className="grid gap-12 md:grid-cols-3">
              {/* Personal Growth */}
              <div className="space-y-6">
                <Badge className="bg-black/5 text-black hover:bg-black/10">
                  Personal Growth
                </Badge>
                <h3 className="text-2xl font-semibold text-black">
                  Understand Your Cognitive Style
                </h3>
                <p className="text-lg text-gray-600">
                  Discover how your brain processes information, handles emotions, and approaches challenges.
                  Use these insights to optimize your daily life and decision-making.
                </p>
              </div>

              {/* Professional Development */}
              <div className="space-y-6">
                <Badge className="bg-black/5 text-black hover:bg-black/10">
                  Professional Development
                </Badge>
                <h3 className="text-2xl font-semibold text-black">
                  Leverage Your Strengths
                </h3>
                <p className="text-lg text-gray-600">
                  Gain a deeper understanding of your cognitive advantages and learn how to apply them in your
                  professional life.
                </p>
              </div>

              {/* Health & Wellness */}
              <div className="space-y-6">
                <Badge className="bg-black/5 text-black hover:bg-black/10">
                  Health & Wellness
                </Badge>
                <h3 className="text-2xl font-semibold text-black">
                  Informed Decisions
                </h3>
                <p className="text-lg text-gray-600">
                  Access detailed insights about your brain's health and structure, empowering you to make
                  informed decisions about your cognitive wellness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-4xl font-bold text-center text-black">
              Trust
            </h2>
            
            <div className="space-y-16"> {/* Reduced from space-y-24 */}
              {/* Clinical Foundation & Scientific Process */}
              <div className="grid gap-12 md:grid-cols-2">
                <div className="space-y-6">
                  <Badge className="bg-black/5 text-black hover:bg-black/10">
                    Clinical Foundation
                  </Badge>
                  <h3 className="text-2xl font-semibold text-black">Where Innovation Meets Excellence</h3>
                  <p className="text-lg text-gray-600">
                    Our platform emerges from collaborations with leading neurologists and research institutions.
                    Each feature is developed and refined through rigorous clinical validation.
                  </p>
                </div>

                <div className="space-y-6">
                  <Badge className="bg-black/5 text-black hover:bg-black/10">
                    Scientific Process
                  </Badge>
                  <h3 className="text-2xl font-semibold text-black">Precision in Every Detail</h3>
                  <p className="text-lg text-gray-600">
                    From MRI acquisition protocols to advanced data analysis, every step of our process adheres to
                    the highest scientific standards. We combine proven methodologies with cutting-edge analysis
                    techniques.
                  </p>
                </div>
              </div>

              {/* Quality Care & Data Philosophy */}
              <div className="grid gap-12 md:grid-cols-2">
                <div className="space-y-6">
                  <Badge className="bg-black/5 text-black hover:bg-black/10">
                    Quality Care
                  </Badge>
                  <h3 className="text-2xl font-semibold text-black">A Network of Excellence</h3>
                  <p className="text-lg text-gray-600">
                    Our carefully selected network of premium MRI facilities ensures exceptional image quality and
                    a superior experience. Each facility meets our strict standards for technology and patient care.
                  </p>
                </div>

                <div className="space-y-6">
                  <Badge className="bg-black/5 text-black hover:bg-black/10">
                    Data Philosophy
                  </Badge>
                  <h3 className="text-2xl font-semibold text-black">Your Privacy, Our Priority</h3>
                  <p className="text-lg text-gray-600">
                    We believe your brain data is as personal as your thoughts. Our platform is built on a foundation
                    of privacy-first technology, ensuring your data remains secure and under your control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leading Institutions Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-8 text-sm text-gray-600">
              With team members from leading institutions
            </p>
            <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-50 md:grid-cols-5">
              {['Columbia', 'Berkeley', 'Stanford', 'Boston', 'Cambridge'].map(
                (university, i) => (
                  <Image
                    key={i}
                    src={`/assets/images/main/university-${university}.png`}
                    alt={`${university} University`}
                    width={120}
                    height={40}
                  />
                )
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-b from-black to-black/95 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 mt-4 text-4xl font-bold text-white">
              Begin Your Journey of Discovery
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Take the first step toward understanding your unique cognitive
              profile. Whether you're starting fresh or have existing MRI data,
              we're here to illuminate the patterns that make you who you are.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90"
              >
                Start Your Discovery
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white/10 hover:text-white"
              >
                Schedule a Consultation
              </Button>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              Have questions? Our team of specialists is here to help guide your journey.{' '}
              <span className="text-white">Schedule a consultation now.</span>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
