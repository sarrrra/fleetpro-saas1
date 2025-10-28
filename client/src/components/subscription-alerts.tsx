import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Building2, ArrowRight } from "lucide-react";
import { type Organization } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";

export function SubscriptionAlerts() {
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/admin/organizations"],
  });

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoon = organizations.filter(org => {
    if (!org.dateFinAbonnement) return false;
    const endDate = new Date(org.dateFinAbonnement);
    return endDate > now && endDate <= thirtyDaysFromNow;
  });

  const expired = organizations.filter(org => {
    if (!org.dateFinAbonnement) return false;
    return new Date(org.dateFinAbonnement) < now;
  });

  const hasAlerts = expiringSoon.length > 0 || expired.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20" data-testid="card-subscription-alerts">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Alertes Abonnements</CardTitle>
          </div>
          <Link href="/admin/organisations">
            <Button variant="outline" size="sm" data-testid="button-view-organizations">
              Gérer <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {expired.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" data-testid="badge-expired-count">
                {expired.length} Expiré{expired.length > 1 ? "s" : ""}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Abonnements expirés
              </span>
            </div>
            <div className="space-y-1">
              {expired.slice(0, 3).map(org => (
                <div
                  key={org.id}
                  className="flex items-center gap-2 text-sm"
                  data-testid={`alert-expired-${org.id}`}
                >
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{org.nom}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-destructive text-xs">
                    Expiré le {format(new Date(org.dateFinAbonnement!), "dd/MM/yyyy", { locale: fr })}
                  </span>
                </div>
              ))}
              {expired.length > 3 && (
                <p className="text-xs text-muted-foreground pl-5">
                  +{expired.length - 3} autre{expired.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {expiringSoon.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" data-testid="badge-expiring-count">
                {expiringSoon.length} Bientôt
              </Badge>
              <span className="text-sm text-muted-foreground">
                Expirent dans 30 jours
              </span>
            </div>
            <div className="space-y-1">
              {expiringSoon.slice(0, 3).map(org => (
                <div
                  key={org.id}
                  className="flex items-center gap-2 text-sm"
                  data-testid={`alert-expiring-${org.id}`}
                >
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{org.nom}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-orange-600 dark:text-orange-400 text-xs">
                    Expire le {format(new Date(org.dateFinAbonnement!), "dd/MM/yyyy", { locale: fr })}
                  </span>
                </div>
              ))}
              {expiringSoon.length > 3 && (
                <p className="text-xs text-muted-foreground pl-5">
                  +{expiringSoon.length - 3} autre{expiringSoon.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
