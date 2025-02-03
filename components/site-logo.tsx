import * as React from 'react'
import { Brain } from 'lucide-react'

interface SiteLogoProps extends React.SVGProps<SVGSVGElement> {}

const SiteLogo = (props: SiteLogoProps) => {
  return <Brain className="h-8 w-8 text-[#68C9B2]" {...props} />
}

export { SiteLogo, type SiteLogoProps }
