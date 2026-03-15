'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Rocket } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Puzzle,
  Settings,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { title: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Intégrations', href: '/dashboard/settings', icon: Puzzle },
  { title: 'Alertes', href: '/dashboard/alerts', icon: Bell },
  { title: 'Paramètres', href: '/dashboard/settings#compte', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent"
        aria-label="Ouvrir le menu de navigation"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar">
        <div className="flex h-16 items-center border-b px-4 gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold">SaaSPilot</span>
        </div>
        <nav className="space-y-0.5 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const baseHref = item.href.split('#')[0]
            const isActive = pathname === baseHref || (baseHref !== '/dashboard' && pathname.startsWith(baseHref + '/'))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  )
}
