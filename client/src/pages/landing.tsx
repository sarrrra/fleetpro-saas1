import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Users, Wrench, Fuel, Wallet, TrendingUp, Shield, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
              <Car className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-1">
            FleetPro
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Solution SaaS B2B pour la gestion complète de votre parc automobile
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Se connecter
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-chart-1/10">
                  <Car className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Gestion du Parc</h3>
                  <p className="text-sm text-muted-foreground">
                    Suivez tous vos véhicules (automobiles, camions, bus, engins) en temps réel
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-chart-2/10">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Chauffeurs & Clients</h3>
                  <p className="text-sm text-muted-foreground">
                    Gérez vos chauffeurs, clients et contrats de location
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-chart-3/10">
                  <Wrench className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Entretien Préventif</h3>
                  <p className="text-sm text-muted-foreground">
                    Planifiez les entretiens avec alertes automatiques
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Fuel className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Suivi Carburant</h3>
                  <p className="text-sm text-muted-foreground">
                    Contrôlez la consommation et les coûts de carburant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-chart-2/10">
                  <Wallet className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Trésorerie</h3>
                  <p className="text-sm text-muted-foreground">
                    Gérez vos finances, factures et soldes clients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-chart-1/10">
                  <TrendingUp className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Analyses & Rapports</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualisez vos KPIs et performances en temps réel
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-chart-2/10">
                <Shield className="h-8 w-8 text-chart-2" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Multi-Tenant Sécurisé</h3>
            <p className="text-sm text-muted-foreground">
              Vos données sont isolées et sécurisées
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Gain de Temps</h3>
            <p className="text-sm text-muted-foreground">
              Automatisez vos processus de gestion
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-chart-1/10">
                <TrendingUp className="h-8 w-8 text-chart-1" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Optimisation des Coûts</h3>
            <p className="text-sm text-muted-foreground">
              Réduisez vos dépenses opérationnelles
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Prêt à optimiser votre parc automobile ?</h2>
              <p className="text-muted-foreground mb-6">
                Rejoignez les entreprises qui font confiance à FleetPro
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-get-started"
              >
                Commencer maintenant
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer with admin setup link */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            FleetPro © 2024 - Gestion de Parc Automobile
          </p>
          <Link href="/admin/setup">
            <button className="text-xs text-muted-foreground hover:text-foreground mt-2 underline" data-testid="link-admin-setup">
              Configuration administrateur
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
