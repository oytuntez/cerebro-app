'use client'

import * as React from 'react'

import { HorizontalNavigation } from '@/app/dashboard/components/horizontal-navigation'
import { MobileNavigation } from '@/app/dashboard/components/mobile-navigation'

const AppPanel = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen">
        <div className="flex flex-col min-h-screen">
          <HorizontalNavigation />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileNavigation />
        <div>
          {children}
        </div>
      </div>
    </>
  )
}

export { AppPanel }
