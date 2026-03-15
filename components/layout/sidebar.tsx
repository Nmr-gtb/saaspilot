'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Puzzle,
  Settings,
  Rocket,
  Bell,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { title: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Intégrations', href: '/dashboard/settings', icon: Puzzle },
  { title: 'Alertes', href: '/dashboard/alerts', icon: Bell },
  { title: 'Paramètres', href: '/dashboard/settings#compte', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          'relative flex h-screen flex-col border-r bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b px-4', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="ml-2.5 text-lg font-bold">SaaSPilot</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const baseHref = item.href.split('#')[0]
            const isActive = pathname === baseHref || (baseHref !== '/dashboard' && pathname.startsWith(baseHref + '/'))

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger className="w-full">
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <Separator />

        {/* Collapse toggle */}
        <div className={cn('p-2', collapsed && 'flex justify-center')}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-xl"
            onClick={onToggle}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
            />
            {!collapsed && <span className="ml-2 text-xs">Réduire</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
