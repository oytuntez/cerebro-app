'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { LucideIcon, type LucideIconName } from '@/lib/lucide-icon'
import {
  dashboardConfig,
  type DashboardNavItem,
} from '@/config/dashboard'
import { useUserAPI } from '@/queries/client/users'
import { useSelectedScan } from '../hooks/use-selected-scan'
import { ScanSelector } from './scan-selector'

const HorizontalNavigation = () => {
  const { user } = useUserAPI()

  return (
    <div className="bg-background border-b">
      <div className="px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Scan Selector */}
          <div className="flex-shrink-0">
            <ScanSelector />
          </div>
          
          {/* Navigation Items */}
          <nav className="flex items-center gap-1 overflow-x-auto flex-1">
            {dashboardConfig?.nav?.map((item: DashboardNavItem) => {
            const denied =
              Array.isArray(item?.roles) &&
              user?.role &&
              !item?.roles?.includes(user?.role)

            return denied ? null : (
              <React.Fragment key={item?.id}>
                {item?.separator ? <div className="mx-2 h-6 w-px bg-border" /> : null}
                <HorizontalNavItem item={item} />
              </React.Fragment>
            )
          })}
          </nav>
        </div>
      </div>
    </div>
  )
}

const HorizontalNavItem = ({ item }: { item: DashboardNavItem }) => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { selectedScan } = useSelectedScan()

  // Preserve scan query parameter for result sub-pages
  const getHrefWithParams = (originalHref: string) => {
    // Try to get scan ID from URL first, then fall back to selected scan
    const scanId = searchParams.get('scan') || selectedScan?.id
    if (scanId && typeof originalHref === 'string' && originalHref.startsWith('/dashboard/results/')) {
      return `${originalHref}?scan=${scanId}`
    }
    return originalHref
  }

  const finalHref = getHrefWithParams(item.href)
  const isActive = pathname === item.href || pathname.startsWith(item.href)

  return (
    <Link
      href={finalHref}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
        item.disabled ? 'pointer-events-none opacity-50' : 'hover:bg-secondary/20 hover:text-foreground',
        isActive
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
      aria-disabled={item.disabled}
    >
      {item.iconName && (
        <LucideIcon
          name={item.iconName}
          className="h-4 w-4"
        />
      )}
      <span className="text-sm">
        {item.translate === 'yes' ? t(item.text) : item.text}
      </span>
    </Link>
  )
}

export { HorizontalNavigation }