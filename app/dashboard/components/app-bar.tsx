'use client'

import * as React from 'react'
import Link from 'next/link'

import { AccountMenu } from '@/components/account-menu'
import { SiteBrand } from '@/components/site-brand'
import { Button } from '@/components/ui/button'
import { Notify } from '@/app/dashboard/components/notify'
import { LucideIcon } from '@/lib/lucide-icon'

import { cn } from '@/lib/utils'

interface AppBarProps extends React.HTMLAttributes<HTMLElement> {}

const AppBar = ({ children, className, ...props }: AppBarProps) => {
  return (
    <header
      className={cn(
        'flex w-full items-center gap-4 border-b bg-background px-4',
        'h-[80px]',
        className
      )}
      {...props}
    >
      <SiteBrand />
      {children}
      <div className="flex-1"></div>
      <div className="hidden sm:flex items-center gap-2">
        <Link href="/dashboard/scans">
          <Button variant="ghost" className="gap-2">
            <LucideIcon name="Brain" className="h-4 w-4" />
            <span className="hidden md:inline">My Scans</span>
          </Button>
        </Link>
        <Link href="/dashboard/upload">
          <Button className="gap-2">
            <LucideIcon name="Upload" className="h-4 w-4" />
            <span className="hidden md:inline">Upload MRI</span>
          </Button>
        </Link>
        <Notify />
      </div>
      <AccountMenu />
    </header>
  )
}

export { AppBar, type AppBarProps }
