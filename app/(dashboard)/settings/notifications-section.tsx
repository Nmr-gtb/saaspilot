'use client'

import { useState } from 'react'

interface ToggleProps {
  id: string
  defaultChecked?: boolean
  label: string
  description: string
}

function Toggle({ id, defaultChecked = false, label, description }: ToggleProps) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export function NotificationsSection() {
  return (
    <div className="space-y-4">
      <Toggle
        id="email-alerts"
        defaultChecked
        label="Alertes par email"
        description="Recevoir les notifications quand une alerte se déclenche"
      />
      <div className="border-t" />
      <Toggle
        id="weekly-report"
        defaultChecked
        label="Rapport hebdomadaire"
        description="Recevoir un résumé de vos métriques chaque lundi"
      />
    </div>
  )
}
