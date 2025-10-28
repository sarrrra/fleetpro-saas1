import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, AlertTriangle, CheckCircle, Edit } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { type Organization } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrganizationWithStats extends Organization {
  totalVehicles?: number;
  totalUsers?: number;
}

export default function AdminOrganisations() {
  const { toast } = useToast();
  const [editingOrg, setEditingOrg] = useState<OrganizationWithStats | null>(null);

  const { data: organizations = [], isLoading } = useQuery<OrganizationWithStats[]>({
    queryKey: ["/api/admin/organizations"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Organization> }) => {
      return apiRequest("PATCH", `/api/admin/organizations/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations"] });
      toast({
        title: "Succès",
        description: "Organisation mise à jour avec succès",
      });
      setEditingOrg(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de l'organisation",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      nomGerant: "",
      prenomGerant: "",
      emailGerant: "",
      telephoneGerant: "",
      dateDebutAbonnement: "",
      dateFinAbonnement: "",
      statutAbonnement: "actif" as "actif" | "expire" | "suspendu",
    },
  });

  const handleEdit = (org: OrganizationWithStats) => {
    setEditingOrg(org);
    form.reset({
      nomGerant: org.nomGerant || "",
      prenomGerant: org.prenomGerant || "",
      emailGerant: org.emailGerant || "",
      telephoneGerant: org.telephoneGerant || "",
      dateDebutAbonnement: org.dateDebutAbonnement ? format(new Date(org.dateDebutAbonnement), "yyyy-MM-dd") : "",
      dateFinAbonnement: org.dateFinAbonnement ? format(new Date(org.dateFinAbonnement), "yyyy-MM-dd") : "",
      statutAbonnement: (org.statutAbonnement as "actif" | "expire" | "suspendu") || "actif",
    });
  };

  const onSubmit = (data: any) => {
    if (!editingOrg) return;

    updateMutation.mutate({
      id: editingOrg.id,
      updates: {
        nomGerant: data.nomGerant,
        prenomGerant: data.prenomGerant,
        emailGerant: data.emailGerant,
        telephoneGerant: data.telephoneGerant,
        dateDebutAbonnement: data.dateDebutAbonnement ? new Date(data.dateDebutAbonnement) : null,
        dateFinAbonnement: data.dateFinAbonnement ? new Date(data.dateFinAbonnement) : null,
        statutAbonnement: data.statutAbonnement,
      },
    });
  };

  // Calculer les statistiques
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: organizations.length,
    actives: organizations.filter(org => org.statutAbonnement === "actif").length,
    expiringSoon: organizations.filter(org => {
      if (!org.dateFinAbonnement) return false;
      const endDate = new Date(org.dateFinAbonnement);
      return endDate > now && endDate <= thirtyDaysFromNow;
    }).length,
    expired: organizations.filter(org => {
      if (!org.dateFinAbonnement) return false;
      return new Date(org.dateFinAbonnement) < now;
    }).length,
  };

  const columns: ColumnDef<OrganizationWithStats>[] = [
    {
      accessorKey: "nom",
      header: "Nom Entreprise",
      cell: ({ row }) => (
        <div className="font-medium" data-testid={`text-org-name-${row.original.id}`}>
          {row.original.nom}
        </div>
      ),
    },
    {
      accessorKey: "gerant",
      header: "Gérant",
      cell: ({ row }) => {
        const { prenomGerant, nomGerant } = row.original;
        if (!prenomGerant && !nomGerant) return <span className="text-muted-foreground">-</span>;
        return (
          <div data-testid={`text-manager-${row.original.id}`}>
            {prenomGerant} {nomGerant}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground" data-testid={`text-email-${row.original.id}`}>
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "telephone",
      header: "Téléphone",
      cell: ({ row }) => (
        <div className="text-muted-foreground" data-testid={`text-phone-${row.original.id}`}>
          {row.original.telephone || "-"}
        </div>
      ),
    },
    {
      accessorKey: "dateFinAbonnement",
      header: "Fin Abonnement",
      cell: ({ row }) => {
        if (!row.original.dateFinAbonnement) {
          return <span className="text-muted-foreground">-</span>;
        }
        const endDate = new Date(row.original.dateFinAbonnement);
        const isExpiringSoon = endDate > now && endDate <= thirtyDaysFromNow;
        const isExpired = endDate < now;

        return (
          <div className="flex items-center gap-2" data-testid={`text-end-date-${row.original.id}`}>
            {format(endDate, "dd/MM/yyyy", { locale: fr })}
            {isExpiringSoon && <AlertTriangle className="h-4 w-4 text-orange-500" />}
            {isExpired && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
        );
      },
    },
    {
      accessorKey: "statutAbonnement",
      header: "Statut",
      cell: ({ row }) => {
        const statut = row.original.statutAbonnement || "actif";
        const variant = statut === "actif" ? "default" : statut === "expire" ? "destructive" : "secondary";
        const label = statut === "actif" ? "Actif" : statut === "expire" ? "Expiré" : "Suspendu";

        return (
          <Badge variant={variant} data-testid={`badge-status-${row.original.id}`}>
            {label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row.original)}
          data-testid={`button-edit-${row.original.id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="heading-admin-organizations">
            Gestion des Entreprises
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Administration des organisations clientes FleetPro
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-orgs">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-orgs">
              {stats.actives}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirent Bientôt</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500" data-testid="stat-expiring-orgs">
              {stats.expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground">Dans 30 jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirés</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-expired-orgs">
              {stats.expired}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Organisations</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={organizations}
            searchPlaceholder="Rechercher une entreprise..."
          />
        </CardContent>
      </Card>

      <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'Organisation</DialogTitle>
            <DialogDescription>
              Modifier les informations de {editingOrg?.nom}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prenomGerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom Gérant</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-prenom-gerant" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nomGerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom Gérant</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-nom-gerant" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailGerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Gérant</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email-gerant" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telephoneGerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone Gérant</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-telephone-gerant" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateDebutAbonnement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Début Abonnement</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date-debut" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFinAbonnement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Fin Abonnement</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date-fin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statutAbonnement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut Abonnement</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-statut">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="actif">Actif</SelectItem>
                          <SelectItem value="expire">Expiré</SelectItem>
                          <SelectItem value="suspendu">Suspendu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingOrg(null)}
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
