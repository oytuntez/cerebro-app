'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface SiteBrandProps extends React.HTMLAttributes<HTMLDivElement> {}

const SiteBrand = ({ className, ...props }: SiteBrandProps) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        {!mounted ? (
          <Image
            src="/assets/images/main/logo.png"
            alt="Brain Yes"
            width={200}
            height={75}
            className="object-cover mt-1"
            priority
          />
        ) : (
          <>
            <Image
              src="/assets/images/main/logo.png"
              alt="Brain Yes"
              width={200}
              height={75}
              className="object-cover mt-1 dark:hidden"
              priority
            />
            <Image
              src="/assets/images/main/logo-dark.png"
              alt="Brain Yes"
              width={200}
              height={75}
              className="hidden object-cover mt-1 dark:block"
              priority
            />
          </>
        )}
      </div>
    </Link>
  )
}

export { SiteBrand }
