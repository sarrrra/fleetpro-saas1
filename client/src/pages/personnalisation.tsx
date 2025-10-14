import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Palette, Save, Upload } from "lucide-react";
import type { OrganizationSettings } from "@shared/schema";

export default function Personnalisation() {
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useQuery<OrganizationSettings>({
    queryKey: ['/api/settings'],
  });

  const { register, handleSubmit, watch } = useForm({
    values: settings || {},
  });

  const couleurPrimaire = watch("couleurPrimaire") || "#2563eb";
  const couleurSecondaire = watch("couleurSecondaire") || "#64748b";

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
        title: "Personnalisation mise à jour",
        description: "Les paramètres de personnalisation ont été enregistrés.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la personnalisation.",
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
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Personnalisation</h1>
            <p className="text-sm text-muted-foreground">
              Personnalisez l'apparence de votre application
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo de l'entreprise</CardTitle>
              <CardDescription>
                Téléchargez le logo de votre entreprise (format recommandé: PNG, SVG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">URL du logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    data-testid="input-logo"
                    {...register("logo")}
                    placeholder="https://exemple.com/logo.png ou data:image/..."
                  />
                  <Button type="button" variant="outline" data-testid="button-upload-logo">
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
                {settings?.logo && (
                  <div className="mt-3 p-4 border rounded-lg bg-muted/50">
                    <img
                      src={settings.logo}
                      alt="Logo"
                      className="max-h-24 object-contain"
                      data-testid="img-logo-preview"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Couleurs du thème</CardTitle>
              <CardDescription>
                Personnalisez les couleurs principales de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="couleur_primaire">Couleur primaire</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="couleur_primaire"
                      type="color"
                      data-testid="input-couleur-primaire"
                      {...register("couleurPrimaire")}
                      className="h-12 w-20"
                    />
                    <Input
                      type="text"
                      value={couleurPrimaire}
                      readOnly
                      className="flex-1"
                      data-testid="text-couleur-primaire"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilisée pour les boutons, liens et éléments actifs
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="couleur_secondaire">Couleur secondaire</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="couleur_secondaire"
                      type="color"
                      data-testid="input-couleur-secondaire"
                      {...register("couleurSecondaire")}
                      className="h-12 w-20"
                    />
                    <Input
                      type="text"
                      value={couleurSecondaire}
                      readOnly
                      className="flex-1"
                      data-testid="text-couleur-secondaire"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilisée pour les badges et éléments secondaires
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm font-medium mb-3">Aperçu des couleurs</div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    style={{ backgroundColor: couleurPrimaire }}
                    className="text-white"
                    data-testid="preview-button-primary"
                  >
                    Bouton Primaire
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    style={{ backgroundColor: couleurSecondaire }}
                    className="text-white"
                    data-testid="preview-button-secondary"
                  >
                    Bouton Secondaire
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              data-testid="button-save-customization"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
