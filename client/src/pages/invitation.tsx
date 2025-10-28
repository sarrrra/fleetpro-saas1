import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Mail, Building2, Calendar, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface InvitationDetails {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: string;
  expiresAt: string;
  isExpired: boolean;
  isUsed: boolean;
  invitedBy: string;
}

export default function InvitationPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/invitation/:token");
  const token = params?.token || "";

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/user")
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(() => setCurrentUser(null));
  }, []);

  const { data: invitation, isLoading, error } = useQuery<InvitationDetails>({
    queryKey: ["/api/invitations", token],
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/invitations/${token}/accept`, {});
    },
    onSuccess: () => {
      toast({
        title: "Invitation acceptée",
        description: "Vous avez été ajouté à l'organisation avec succès",
      });
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'acceptation de l'invitation",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    if (!currentUser) {
      window.location.href = "/api/login";
      return;
    }

    acceptMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-muted-foreground mt-4">Chargement de l'invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Invitation introuvable</CardTitle>
            </div>
            <CardDescription>
              Cette invitation n'existe pas ou a expiré.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full" data-testid="button-home">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Invitation expirée</CardTitle>
            </div>
            <CardDescription>
              Cette invitation a expiré le {format(new Date(invitation.expiresAt), "dd MMMM yyyy", { locale: fr })}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Veuillez contacter l'administrateur pour recevoir une nouvelle invitation.
            </p>
            <Button onClick={() => navigate("/")} className="w-full" data-testid="button-home">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Invitation déjà utilisée</CardTitle>
            </div>
            <CardDescription>
              Cette invitation a déjà été acceptée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full" data-testid="button-home">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle>Invitation à rejoindre une organisation</CardTitle>
          </div>
          <CardDescription>
            Vous avez été invité à rejoindre une organisation FleetPro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Organisation</p>
                <p className="text-lg font-bold" data-testid="text-org-name">
                  {invitation.organizationName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Rôle assigné</p>
                <Badge className="mt-1" data-testid="badge-role">
                  {invitation.role === "admin_entreprise" ? "Administrateur Entreprise" : invitation.role}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email invité</p>
                <p className="text-sm" data-testid="text-email">
                  {invitation.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Expire le</p>
                <p className="text-sm" data-testid="text-expires">
                  {format(new Date(invitation.expiresAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          {!currentUser ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Vous devez vous connecter pour accepter cette invitation
                </p>
              </div>
              <Button
                onClick={handleAccept}
                className="w-full"
                data-testid="button-login-accept"
              >
                Se connecter et accepter
              </Button>
            </div>
          ) : currentUser.email === invitation.email ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <p className="text-sm text-green-900 dark:text-green-100">
                  Vous êtes connecté en tant que {currentUser.email}
                </p>
              </div>
              <Button
                onClick={handleAccept}
                className="w-full"
                disabled={acceptMutation.isPending}
                data-testid="button-accept"
              >
                {acceptMutation.isPending ? "Acceptation..." : "Accepter l'invitation"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-orange-900 dark:text-orange-100 font-medium">
                    Email incorrect
                  </p>
                  <p className="text-sm text-orange-900/80 dark:text-orange-100/80 mt-1">
                    Vous êtes connecté en tant que {currentUser.email}, mais l'invitation est pour {invitation.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/api/logout"}
                className="w-full"
                data-testid="button-logout"
              >
                Se déconnecter et utiliser un autre compte
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} data-testid="button-cancel">
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
