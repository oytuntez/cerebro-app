'use client'

import * as React from 'react'
import Link from 'next/link'
import { SiteBrand } from '@/components/site-brand'
import { Button } from '@/components/ui/button'
import { AccountMenu } from './account-menu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side - Brand */}
        <SiteBrand />

        {/* Right side - Navigation + Account */}
        <div className="flex items-center gap-8">
          {/* Marketing Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#your-brain" className="text-sm font-medium text-gray-600 hover:text-black">
              Your Brain
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-black">
              How it Works
            </Link>
            <Link href="#science" className="text-sm font-medium text-gray-600 hover:text-black">
              Science
            </Link>
          </nav>

          {/* Account Section */}
          <div className="flex items-center gap-2">
            <Button variant="default" className="bg-black text-white hover:bg-black/90">
              Dashboard
            </Button>
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
