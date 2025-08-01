'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LucideIcon } from '@/lib/lucide-icon'
import { cn } from '@/lib/utils'
import {
  dashboardConfig,
  type DashboardNavItem,
} from '@/config/dashboard'
import { ScanSelector } from './scan-selector'

export function MobileNavigation() {
  const pathname = usePathname()

  // Find current page
  const currentItem = dashboardConfig.nav.find(item => 
    item.href === pathname || pathname.startsWith(item.href)
  )
  
  const currentTitle = currentItem?.text || 'Navigation'
  const currentIcon = currentItem?.iconName || 'Menu'

  return (
    <div className="lg:hidden space-y-4 p-4 border-b bg-background">
      <ScanSelector />
      
      {/* Mobile action buttons */}
      <div className="flex gap-2">
        <Link href="/dashboard/scans" className="flex-1">
          <Button variant="ghost" className="w-full gap-2">
            <LucideIcon name="Brain" className="h-4 w-4" />
            My Scans
          </Button>
        </Link>
        <Link href="/dashboard/upload" className="flex-1">
          <Button className="w-full gap-2">
            <LucideIcon name="Upload" className="h-4 w-4" />
            Upload MRI
          </Button>
        </Link>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <LucideIcon name={currentIcon} className="h-4 w-4" />
              <span>{currentTitle}</span>
            </div>
            <LucideIcon name="ChevronDown" className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {dashboardConfig.nav.map((item: DashboardNavItem) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 w-full',
                  pathname === item.href && 'bg-secondary'
                )}
              >
                <LucideIcon name={item.iconName || 'Circle'} className="h-4 w-4" />
                <span>{item.text}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}