'use client'

import * as React from 'react'
import Link, { type LinkProps } from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui-custom/accordion'

import { cn } from '@/lib/utils'
import { LucideIcon, type LucideIconName } from '@/lib/lucide-icon'
import { useAppSelector } from '@/lib/redux/hooks'
import {
  dashboardConfig,
  type DashboardNavItem,
  type DashboardNavSubItem,
} from '@/config/dashboard'
import { useUserAPI } from '@/queries/client/users'
import { ScanSelector } from './scan-selector'
import { useSelectedScan } from '../hooks/use-selected-scan'

const Navigation = () => {
  const { user } = useUserAPI()
  const pathname = usePathname()
  const defaultValue = pathname.split('/').slice(0, 3).join('/')

  // Group results-related items
  const resultsItems = dashboardConfig?.nav?.filter(item => 
    item.href.startsWith('/dashboard/results/') || item?.id === 1
  )
  const otherItems = dashboardConfig?.nav?.filter(item => 
    !item.href.startsWith('/dashboard/results/') && item?.id !== 1
  )

  return (
    <div className="py-4">
      <Accordion type="multiple" defaultValue={[defaultValue]}>
        {/* Other navigation items */}
        {otherItems?.map((item: DashboardNavItem) => {
          const denied =
            Array.isArray(item?.roles) &&
            user?.role &&
            !item?.roles?.includes(user?.role)
          
          return denied ? null : (
            <React.Fragment key={item?.id}>
              {item?.separator ? <div className="my-4" /> : null}
              <NavItem item={item} />
            </React.Fragment>
          )
        })}
        
        {/* Results panel with scan selector */}
        {resultsItems.length > 0 && (
          <>
            <div className="my-6" />
            <div className="mx-2 bg-accent/40 rounded-lg p-4 space-y-1">
              <ScanSelector />
              <div className="space-y-0">
                {resultsItems?.map((item: DashboardNavItem) => {
                  const denied =
                    Array.isArray(item?.roles) &&
                    user?.role &&
                    !item?.roles?.includes(user?.role)
                  
                  return denied ? null : (
                    <NavItem key={item?.id} item={item} isInPanel={true} />
                  )
                })}
              </div>
            </div>
          </>
        )}
      </Accordion>
    </div>
  )
}

const NavItem = ({ item, isInPanel = false }: { item: DashboardNavItem; isInPanel?: boolean }) => {
  const { t } = useTranslation()
  const { collapsed } = useAppSelector(({ app }) => app)

  return (
    <AccordionItem value={item?.href} className="border-none">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AccordionTrigger
              className={cn(
                isInPanel 
                  ? 'hover:no-underline mx-1'
                  : 'hover:no-underline mx-2',
                Array.isArray(item?.sub) ? '' : 'hover:cursor-default'
              )}
            >
              <NavLink
                collapsed={collapsed}
                href={item?.href}
                translate={item?.translate}
                iconName={item?.iconName}
                iconClassName="mr-3"
                disabled={item?.disabled}
                isInPanel={isInPanel}
              >
                {item?.text}
              </NavLink>
              {!collapsed && Array.isArray(item?.sub) ? (
                <LucideIcon
                  name="ChevronDown"
                  className="size-5 min-w-5 shrink-0 transition-transform duration-200"
                />
              ) : null}
            </AccordionTrigger>
          </TooltipTrigger>
          {collapsed && item?.text ? (
            <TooltipContent side="right" align="center">
              {item?.translate === 'yes' ? t(item?.text) : item?.text}
            </TooltipContent>
          ) : null}
        </Tooltip>
      </TooltipProvider>
      {!collapsed ? <NavSub item={item} /> : null}
    </AccordionItem>
  )
}

const NavSub = ({ item }: { item: DashboardNavItem }) => {
  const { user } = useUserAPI()
  const { collapsed } = useAppSelector(({ app }) => app)

  return (
    <AccordionContent
      className={cn(
        'pb-0',
        Array.isArray(item?.sub) && item?.sub?.length > 0
          ? 'mb-4 ml-8 space-y-2 px-6 pt-2'
          : ''
      )}
    >
      {item?.sub?.map((sub: DashboardNavSubItem) => {
        const denied =
          Array.isArray(sub?.roles) &&
          user?.role &&
          !sub?.roles?.includes(user?.role)
        return denied ? null : (
          <React.Fragment key={sub?.id}>
            {sub?.separator ? <div className="my-2" /> : null}
            <NavLink
              collapsed={collapsed}
              href={sub?.href}
              translate={sub?.translate}
              iconName={sub?.iconName}
              iconClassName="mr-2 size-4 min-w-4"
              disabled={sub?.disabled}
            >
              {sub?.text}
            </NavLink>
          </React.Fragment>
        )
      })}
    </AccordionContent>
  )
}

interface NavLinkProps
  extends LinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  collapsed: boolean
  iconName?: LucideIconName
  iconClassName?: string
  text?: string
  ns?: string
  disabled?: boolean
  isInPanel?: boolean
}

const NavLink = ({
  children,
  className,
  href,
  collapsed,
  iconName,
  iconClassName,
  text,
  ns,
  translate,
  disabled = false,
  isInPanel = false,
  ...props
}: NavLinkProps) => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { selectedScan } = useSelectedScan()
  const parent = pathname.split('/').slice(0, 3).join('/')

  // Preserve scan query parameter for result sub-pages
  const getHrefWithParams = (originalHref: string) => {
    // Try to get scan ID from URL first, then fall back to selected scan
    const scanId = searchParams.get('scan') || selectedScan?.id
    if (scanId && typeof originalHref === 'string' && originalHref.startsWith('/dashboard/results/')) {
      return `${originalHref}?scan=${scanId}`
    }
    return originalHref
  }

  const finalHref = getHrefWithParams(href)

  return (
    <div className={cn(disabled ? 'cursor-not-allowed' : '')}>
      <Link
        href={finalHref}
        className={cn(
          'flex items-center break-all text-left text-base py-2 px-4 rounded-xl transition-colors',
          disabled ? 'pointer-events-none opacity-50' : 'hover:bg-accent hover:text-accent-foreground hover:no-underline',
          [pathname, parent].includes(href as string)
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground',
          className
        )}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        {...props}
      >
        {iconName ? (
          <LucideIcon
            name={iconName}
            className={cn(`mr-3 size-5 min-w-5`, iconClassName)}
          />
        ) : null}
        <span className={cn(collapsed ? 'hidden' : '')}>
          {text && translate === 'yes' ? t(text, { ns }) : text}
          {children && typeof children === 'string' && translate === 'yes'
            ? t(children, { ns })
            : children}
        </span>
      </Link>
    </div>
  )
}

export { Navigation }
