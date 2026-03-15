export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .eq('provider', 'stripe')
    .eq('is_active', true)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single()

  const isStripeConnected = !!integration

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Gérez vos intégrations et les paramètres de votre compte</p>
      </div>

      {/* Stripe Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Intégration Stripe</CardTitle>
              <CardDescription>Connectez votre compte Stripe pour suivre vos métriques de revenus</CardDescription>
            </div>
            {isStripeConnected ? (
              <Badge className="gap-1.5 text-green-600 border-green-600/30 bg-green-600/10">
                <CheckCircle className="h-3 w-3" />
                Connecté
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                Non connecté
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isStripeConnected ? (
            <div className="space-y-3">
              <div className="rounded-xl border bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ID du compte</span>
                  <span className="font-mono text-xs">{integration.stripe_account_id}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Connecté le</span>
                  <span>{new Date(integration.connected_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <form action="/api/stripe/sync" method="POST">
                  <Button type="submit" variant="outline" size="sm" className="rounded-xl">
                    Synchroniser les métriques
                  </Button>
                </form>
                <form action="/api/stripe/connect" method="POST">
                  <input type="hidden" name="action" value="disconnect" />
                  <Button type="submit" variant="outline" size="sm" className="text-destructive border-destructive/30 rounded-xl">
                    Déconnecter
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connectez votre compte Stripe pour synchroniser automatiquement le MRR, le taux de churn, l&apos;ARPU et les métriques clients.
              </p>
              <a href="/api/stripe/connect">
                <Button className="gap-2 rounded-xl">
                  <ExternalLink className="h-4 w-4" />
                  Connecter Stripe
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Compte</CardTitle>
          <CardDescription>Informations de votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border bg-muted/50 p-3 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Offre</span>
              <Badge variant="secondary" className="capitalize">
                {profile?.plan ?? 'gratuit'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Membre depuis</span>
              <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
