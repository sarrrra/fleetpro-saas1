import { useState } from "react";
import { AddClientDialog } from "@/components/add-client-dialog";
import { EditClientDialog } from "@/components/edit-client-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchLower) ||
      client.telephone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.entreprise && client.entreprise.toLowerCase().includes(searchLower))
    );
  });

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            {clients.length} clients enregistrés
          </p>
        </div>
        <AddClientDialog
          trigger={
            <Button data-testid="button-add-client">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Client
            </Button>
          }
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, entreprise, téléphone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-clients"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} data-testid={`card-client-${client.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{client.nom}</CardTitle>
                  {client.entreprise && (
                    <p className="text-sm text-muted-foreground">{client.entreprise}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedClient(client);
                      setEditDialogOpen(true);
                    }}
                    data-testid={`button-edit-client-${client.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(client.id)}
                    data-testid={`button-delete-client-${client.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">📞</span>
                <span>{client.telephone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">✉️</span>
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.adresse && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">📍</span>
                  <span className="truncate">{client.adresse}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Solde :</span>
                  <Badge 
                    variant="default"
                    className={parseFloat(client.solde) >= 0 ? "bg-chart-2" : "bg-destructive"}
                    data-testid={`badge-solde-${client.id}`}
                  >
                    {formatCurrency(client.solde)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun client trouvé</p>
        </div>
      )}

      <EditClientDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
