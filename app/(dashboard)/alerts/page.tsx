'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Bell, Trash2, Plus, AlertTriangle } from 'lucide-react'

interface Alert {
  id: string
  metric: string
  condition: 'above' | 'below' | 'equals'
  threshold: number
  channel: string
  is_active: boolean
  last_triggered_at: string | null
}

const METRIC_LABELS: Record<string, string> = {
  mrr: 'MRR',
  churn_rate: 'Taux de Churn',
  arpu: 'ARPU',
  new_customers: 'Nouveaux Clients',
  active_customers: 'Clients Actifs',
  revenue: 'Revenus',
}

const CONDITION_LABELS: Record<string, string> = {
  above: 'supérieur à',
  below: 'inférieur à',
  equals: 'égal à',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState<{
    metric: string
    condition: 'above' | 'below' | 'equals'
    threshold: string
    channel: string
  }>({
    metric: 'mrr',
    condition: 'below',
    threshold: '',
    channel: 'email',
  })

  useEffect(() => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((data) => {
        setAlerts(data.alerts ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCreate = () => {
    if (!form.threshold) return
    startTransition(async () => {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: form.metric,
          condition: form.condition,
          threshold: parseFloat(form.threshold),
          channel: form.channel,
        }),
      })
      const data = await res.json()
      if (data.alert) {
        setAlerts((prev) => [data.alert, ...prev])
        setShowForm(false)
        setForm({ metric: 'mrr', condition: 'below', threshold: '', channel: 'email' })
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' })
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    })
  }

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      })
      const data = await res.json()
      if (data.alert) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? data.alert : a)))
      }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alertes</h2>
          <p className="text-muted-foreground">Soyez notifié quand vos métriques franchissent un seuil</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Nouvelle alerte
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Créer une alerte</CardTitle>
            <CardDescription>Définissez un seuil d&apos;alerte pour une métrique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Métrique</Label>
                <select
                  className="w-full h-9 rounded-xl border bg-background px-3 text-sm"
                  value={form.metric}
                  onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))}
                >
                  {Object.entries(METRIC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <select
                  className="w-full h-9 rounded-xl border bg-background px-3 text-sm"
                  value={form.condition}
                  onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as 'above' | 'below' | 'equals' }))}
                >
                  <option value="above">Supérieur à</option>
                  <option value="below">Inférieur à</option>
                  <option value="equals">Égal à</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Seuil</Label>
                <Input
                  type="number"
                  placeholder="ex. 10000"
                  value={form.threshold}
                  onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button size="sm" className="rounded-xl" onClick={handleCreate} disabled={isPending || !form.threshold}>
                Créer l&apos;alerte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertes actives
            {alerts.filter((a) => a.is_active).length > 0 && (
              <Badge variant="secondary">{alerts.filter((a) => a.is_active).length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Aucune alerte configurée</p>
              <p className="text-xs text-muted-foreground mt-1">
                Créez une alerte pour être notifié quand vos métriques évoluent
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${alert.is_active ? 'bg-green-500' : 'bg-muted-foreground'}`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {METRIC_LABELS[alert.metric] ?? alert.metric}{' '}
                        <span className="text-muted-foreground font-normal">
                          {CONDITION_LABELS[alert.condition] ?? alert.condition}
                        </span>{' '}
                        <span className="font-mono">{alert.threshold.toLocaleString('fr-FR')}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        via {alert.channel}
                        {alert.last_triggered_at && (
                          <> · déclenché le {new Date(alert.last_triggered_at).toLocaleDateString('fr-FR')}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(alert.id, alert.is_active)}
                      disabled={isPending}
                      className="text-xs h-7 rounded-lg"
                    >
                      {alert.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive rounded-lg"
                      onClick={() => handleDelete(alert.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
