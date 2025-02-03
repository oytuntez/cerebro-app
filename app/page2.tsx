import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Activity, Sparkles, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-[#332B2C]"
            >
              <Brain className="h-8 w-8 text-[#68C9B2]" />
              Cerebro
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <Link
                href="#about"
                className="text-[#332B2C] transition-colors hover:text-[#68C9B2]"
              >
                About
              </Link>
              <Link
                href="#how-it-works"
                className="text-[#332B2C] transition-colors hover:text-[#68C9B2]"
              >
                How it Works
              </Link>
              <Link
                href="#science"
                className="text-[#332B2C] transition-colors hover:text-[#68C9B2]"
              >
                Science
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-[#332B2C]">
                Sign In
              </Button>
              <Button className="bg-[#68C9B2] text-white hover:bg-[#68C9B2]/90">
                Begin Discovery
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <Badge className="bg-[#F7B48A]/10 text-[#F7B48A] transition-colors hover:bg-[#F7B48A]/20">
                Neural Insights
              </Badge>
              <h1 className="text-5xl font-bold leading-tight text-[#332B2C]">
                Know Your Brain.
                <span className="block text-[#68C9B2]">Own Your Story.</span>
              </h1>
              <p className="text-xl text-[#745656]">
                Your brain holds patterns as unique as your fingerprint. Through
                advanced MRI analysis, we reveal the intricate networks that
                shape your memory, drive your creativity, and define your
                emotional intelligence – turning neuroscience into
                self-understanding.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="bg-[#68C9B2] text-white hover:bg-[#68C9B2]/90"
                >
                  Begin Your Discovery
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#68C9B2] text-[#68C9B2]"
                >
                  Learn more about the science
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#332B2C]">18+</span>
                  <span className="text-sm text-[#745656]">
                    Cognitive Domains
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#332B2C]">
                    100%
                  </span>
                  <span className="text-sm text-[#745656]">Personalized</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#332B2C]">
                    24/7
                  </span>
                  <span className="text-sm text-[#745656]">Expert Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#F7B48A]/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-[#68C9B2]/10 blur-3xl" />
              <div className="relative rounded-2xl bg-white p-8 shadow-xl">
                <Image
                  src="/placeholder.svg?height=400&width=500"
                  alt="Brain visualization"
                  width={500}
                  height={400}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Science of You Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge className="bg-[#D9BDB6]/10 text-[#D9BDB6] hover:bg-[#D9BDB6]/20">
              The Science of You
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-[#332B2C]">
              Personal Understanding
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-[#745656]">
              Your brain holds patterns as unique as your fingerprint. Through
              advanced MRI analysis, we reveal the intricate networks that shape
              who you are.
            </p>
          </div>
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
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#68C9B2]/10">
                  <feature.icon className="h-6 w-6 text-[#68C9B2]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#332B2C]">
                  {feature.title}
                </h3>
                <p className="text-[#745656]">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific Foundation Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <Badge className="bg-[#68C9B2]/10 text-[#68C9B2] hover:bg-[#68C9B2]/20">
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
                      <Check className="h-6 w-6 text-[#68C9B2]" />
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
                src="/placeholder.svg?height=600&width=500"
                alt="Scientific research visualization"
                width={500}
                height={600}
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey of Discovery Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge className="bg-[#F7B48A]/10 text-[#F7B48A] hover:bg-[#F7B48A]/20">
              Your Journey
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-[#332B2C]">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-[#745656]">
              From MRI scan to personalized insights, discover the process of
              unlocking your brain's potential.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Premium Brain Imaging',
                description:
                  'Experience a seamless MRI session at one of our premium partner facilities, or upload your existing brain MRI data.',
              },
              {
                number: '02',
                title: 'Advanced Analysis',
                description:
                  'Our platform processes your MRI data through multiple scientific frameworks, analyzing 18 distinct cognitive domains.',
              },
              {
                number: '03',
                title: 'Personal Discovery',
                description:
                  'Access your comprehensive brain insights through our intuitive platform, with clear visualizations and detailed explanations.',
              },
            ].map((step, index) => (
              <Card
                key={index}
                className="p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#68C9B2] text-white">
                  <span className="text-xl font-bold">{step.number}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#332B2C]">
                  {step.title}
                </h3>
                <p className="text-[#745656]">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#332B2C] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="bg-white/10 text-white hover:bg-white/20">
            Begin Your Journey
          </Badge>
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
              className="bg-[#68C9B2] text-white hover:bg-[#68C9B2]/90"
            >
              Start Your Discovery
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#332B2C]"
            >
              Schedule a Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-8 text-sm text-[#745656]">
            Trusted by leading institutions
          </p>
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-50 md:grid-cols-5">
            {['Columbia', 'Berkeley', 'Stanford', 'Boston', 'Cambridge'].map(
              (university, i) => (
                <Image
                  key={i}
                  src={`/placeholder.svg?height=40&width=120&text=${university}`}
                  alt={`${university} University`}
                  width={120}
                  height={40}
                />
              )
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
