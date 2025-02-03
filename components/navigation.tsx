'use client'

import * as React from 'react'
import Link from 'next/link'

import {
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenu,
} from '@/components/ui/navigation-menu'
import { absoluteUrl } from '@/lib/utils'

const Navigation = () => {
  return (
    <NavigationMenu className="hidden md:flex font-['Noto_Sans_KR']">
      <NavigationMenuList className="gap-6">
        <NavigationMenuLink asChild>
          <Link
            href="#your-brain"
            className="text-lg font-medium text-black transition-colors hover:text-black/70"
          >
            Your Brain
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="#how-it-works"
            className="text-lg font-medium text-black transition-colors hover:text-black/70"
          >
            How it Works
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="#science"
            className="text-lg font-medium text-black transition-colors hover:text-black/70"
          >
            Science
          </Link>
        </NavigationMenuLink>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export { Navigation }
