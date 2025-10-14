import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserCog, Trash2 } from "lucide-react";
import type { User } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin_entreprise: "Admin Entreprise",
  gestionnaire: "Gestionnaire",
  chauffeur: "Chauffeur",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  super_admin: "destructive",
  admin_entreprise: "default",
  gestionnaire: "secondary",
  chauffeur: "outline",
};

export default function Administration() {
  const { toast } = useToast();
  
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Rôle modifié",
        description: "Le rôle de l'utilisateur a été mis à jour.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b bg-background p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les utilisateurs et leurs permissions
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs de l'organisation</CardTitle>
            <CardDescription>
              {users?.length || 0} utilisateur(s) enregistré(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card"
                  data-testid={`user-card-${user.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <UserCog className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium" data-testid={`user-name-${user.id}`}>
                        {user.prenom} {user.nom}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`user-email-${user.id}`}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={roleBadgeVariant[user.role]} data-testid={`user-role-badge-${user.id}`}>
                      {roleLabels[user.role]}
                    </Badge>

                    <Select
                      value={user.role}
                      onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                    >
                      <SelectTrigger className="w-[180px]" data-testid={`select-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin_entreprise">Admin Entreprise</SelectItem>
                        <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                        <SelectItem value="chauffeur">Chauffeur</SelectItem>
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-delete-user-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                            <span className="font-semibold">
                              {user.prenom} {user.nom}
                            </span>
                            ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-delete">
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(user.id)}
                            data-testid="button-confirm-delete"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {(!users || users.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description des rôles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="default">Admin Entreprise</Badge>
                <p className="text-sm text-muted-foreground">
                  Accès complet à toutes les fonctionnalités, gestion des paramètres et des utilisateurs
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary">Gestionnaire</Badge>
                <p className="text-sm text-muted-foreground">
                  Gestion des véhicules, chauffeurs, clients, maintenance et trésorerie
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline">Chauffeur</Badge>
                <p className="text-sm text-muted-foreground">
                  Accès en lecture seule aux informations des véhicules et des missions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
