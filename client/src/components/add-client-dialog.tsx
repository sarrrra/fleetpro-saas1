import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddClientDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddClientDialog({ trigger, open: controlledOpen, onOpenChange }: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : open;
  const setDialogOpen = isControlled ? onOpenChange : setOpen;

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    entreprise: "",
    solde: "0",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/clients", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès",
      });
      setFormData({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        entreprise: "",
        solde: "0",
      });
      setDialogOpen?.(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client",
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom / Raison sociale *</Label>
              <Input
                id="nom"
                data-testid="input-nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entreprise">Entreprise</Label>
              <Input
                id="entreprise"
                data-testid="input-entreprise"
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                data-testid="input-telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea
              id="adresse"
              data-testid="input-adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solde">Solde initial (optionnel)</Label>
            <Input
              id="solde"
              data-testid="input-solde"
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
              onClick={() => setDialogOpen?.(false)}
              data-testid="button-cancel"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              data-testid="button-submit-client"
            >
              {mutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
