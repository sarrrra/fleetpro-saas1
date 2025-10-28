import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !securityCode) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, securityCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la promotion");
      }

      setSuccess(true);
      toast({
        title: "Succès",
        description: `L'utilisateur ${email} a été promu en super_admin`,
      });
      setEmail("");
      setSecurityCode("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la promotion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-4" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Configuration Super Admin</CardTitle>
            <CardDescription>
              Promouvoir un utilisateur existant en super administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8" data-testid="success-message">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Promotion réussie !</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  L'utilisateur a été promu en super_admin. Il peut maintenant se connecter et accéder à toutes les fonctionnalités d'administration.
                </p>
                <Button onClick={() => setSuccess(false)} data-testid="button-promote-another">
                  Promouvoir un autre utilisateur
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePromote} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email de l'utilisateur</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="utilisateur@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-email"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    L'utilisateur doit déjà avoir créé un compte en se connectant au moins une fois.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityCode">Code de sécurité</Label>
                  <Input
                    id="securityCode"
                    type="password"
                    placeholder="Code secret d'administration"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-security-code"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Saisissez le code de sécurité défini dans les variables d'environnement.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-promote"
                >
                  {isLoading ? "Promotion en cours..." : "Promouvoir en Super Admin"}
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Les super_admin peuvent gérer toutes les organisations clientes, 
                    voir tous les abonnements, et accéder aux fonctionnalités d'administration globale.
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            FleetPro - Gestion de Parc Automobile
          </p>
        </div>
      </div>
    </div>
  );
}
