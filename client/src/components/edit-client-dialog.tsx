import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    entreprise: "",
    solde: "0",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom || "",
        email: client.email || "",
        telephone: client.telephone || "",
        adresse: client.adresse || "",
        entreprise: client.entreprise || "",
        solde: client.solde || "0",
      });
    }
  }, [client]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/clients/${client?.id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le client",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      nom: formData.nom,
      telephone: formData.telephone,
      solde: formData.solde || "0",
    };

    if (formData.email) submitData.email = formData.email;
    if (formData.adresse) submitData.adresse = formData.adresse;
    if (formData.entreprise) submitData.entreprise = formData.entreprise;

    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nom">Nom / Raison sociale *</Label>
              <Input
                id="edit-nom"
                data-testid="input-edit-nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-entreprise">Entreprise</Label>
              <Input
                id="edit-entreprise"
                data-testid="input-edit-entreprise"
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-telephone">Téléphone *</Label>
              <Input
                id="edit-telephone"
                data-testid="input-edit-telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                data-testid="input-edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-adresse">Adresse</Label>
            <Textarea
              id="edit-adresse"
              data-testid="input-edit-adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-solde">Solde</Label>
            <Input
              id="edit-solde"
              data-testid="input-edit-solde"
              type="number"
              step="0.01"
              value={formData.solde}
              onChange={(e) => setFormData({ ...formData, solde: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              data-testid="button-submit-edit-client"
            >
              {mutation.isPending ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
