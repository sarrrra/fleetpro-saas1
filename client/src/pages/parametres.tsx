import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Building2, Save } from "lucide-react";
import type { OrganizationSettings } from "@shared/schema";

export default function Parametres() {
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useQuery<OrganizationSettings>({
    queryKey: ['/api/settings'],
  });

  const { register, handleSubmit, reset } = useForm({
    values: settings || {},
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les informations de l'entreprise ont été enregistrées.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

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
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Paramètres de l'entreprise</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les informations légales et administratives de votre entreprise
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations légales</CardTitle>
              <CardDescription>
                Documents officiels et identifiants légaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registre_commerce">Registre de commerce</Label>
                  <Input
                    id="registre_commerce"
                    data-testid="input-registre-commerce"
                    {...register("registreCommerce")}
                    placeholder="Ex: 123456789B12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nis">NIS (Numéro d'Identification Statistique)</Label>
                  <Input
                    id="nis"
                    data-testid="input-nis"
                    {...register("nis")}
                    placeholder="Ex: 000123456789012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF (Numéro d'Identification Fiscale)</Label>
                  <Input
                    id="nif"
                    data-testid="input-nif"
                    {...register("nif")}
                    placeholder="Ex: 000123456789012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="article_imposition">Article d'imposition</Label>
                  <Input
                    id="article_imposition"
                    data-testid="input-article-imposition"
                    {...register("articleImposition")}
                    placeholder="Ex: Article 23"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Coordonnées et détails administratifs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom_complet">Nom complet de l'entreprise</Label>
                <Input
                  id="nom_complet"
                  data-testid="input-nom-complet"
                  {...register("nomComplet")}
                  placeholder="Ex: SARL Transport & Logistique"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse complète</Label>
                <Input
                  id="adresse"
                  data-testid="input-adresse-complete"
                  {...register("adresseComplete")}
                  placeholder="Ex: 123 Rue de la République"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville</Label>
                  <Input
                    id="ville"
                    data-testid="input-ville"
                    {...register("ville")}
                    placeholder="Ex: Alger"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code_postal">Code postal</Label>
                  <Input
                    id="code_postal"
                    data-testid="input-code-postal"
                    {...register("codePostal")}
                    placeholder="Ex: 16000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pays">Pays</Label>
                  <Input
                    id="pays"
                    data-testid="input-pays"
                    {...register("pays")}
                    placeholder="Algérie"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    data-testid="input-telephone"
                    {...register("telephone")}
                    placeholder="Ex: +213 123 456 789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    {...register("email")}
                    placeholder="contact@entreprise.dz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_web">Site web</Label>
                <Input
                  id="site_web"
                  data-testid="input-site-web"
                  {...register("siteWeb")}
                  placeholder="https://www.entreprise.dz"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              data-testid="button-reset"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
