import { type LucideIconName } from '@/lib/lucide-icon'

export interface DashboardNavSubItem {
  id: number
  href: string
  text: string
  translate?: 'yes' | 'no'
  iconName?: LucideIconName
  disabled?: boolean
  separator?: boolean
  roles?: string[]
}

export interface DashboardNavItem extends DashboardNavSubItem {
  sub?: DashboardNavSubItem[]
}

export interface DashboardConfig {
  nav: DashboardNavItem[]
}

export const dashboardConfig: DashboardConfig = {
  nav: [
    {
      id: 2,
      href: '/dashboard/upload',
      text: 'Upload MRI',
      translate: 'no',
      iconName: 'Upload',
    },
    {
      id: 3,
      href: '/dashboard/scans',
      text: 'My Scans',
      translate: 'no',
      iconName: 'Brain',
    },
    {
      id: 1,
      href: '/dashboard/results/summary',
      text: 'Summary',
      translate: 'no',
      iconName: 'LayoutDashboard',
      separator: true,
    },
    {
      id: 4,
      href: '/dashboard/results/global-measures',
      text: 'Global Measures',
      translate: 'no',
      iconName: 'Globe',
    },
    {
      id: 5,
      href: '/dashboard/results/cortical-regions',
      text: 'Cortical Regions',
      translate: 'no',
      iconName: 'Brain',
    },
    {
      id: 6,
      href: '/dashboard/results/subcortical',
      text: 'Subcortical',
      translate: 'no',
      iconName: 'Layers',
    },
    {
      id: 7,
      href: '/dashboard/results/curvature',
      text: 'Curvature Stats',
      translate: 'no',
      iconName: 'TrendingUp',
    },
  ],
}
