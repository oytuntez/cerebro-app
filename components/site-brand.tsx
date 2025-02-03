import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SiteBrandProps extends React.HTMLAttributes<HTMLDivElement> {}

const SiteBrand = ({ className, ...props }: SiteBrandProps) => {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <Image
          src="/assets/images/main/tracts2.png"
          alt="Cerebro"
          width={80}
          height={55}
          className="object-cover mt-1"
          priority
        />
      </div>
      <span className="font-['Noto_Sans_KR'] text-xl font-semibold text-black">
        Cerebro
      </span>
    </Link>
  )
}

export { SiteBrand }
