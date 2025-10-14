import { useState } from "react";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Transaction, Vehicle, Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tresorerie() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = `${vehicle.immatriculation} - ${vehicle.marque} ${vehicle.modele}`;
    return acc;
  }, {} as Record<string, string>);

  const clientMap = clients.reduce((acc, client) => {
    acc[client.id] = client.nom;
    return acc;
  }, {} as Record<string, string>);

  const getCategoryLabel = (categorie: string) => {
    const categories: Record<string, string> = {
      location: "Location",
      vente: "Vente",
      service: "Service",
      carburant: "Carburant",
      maintenance: "Maintenance",
      assurance: "Assurance",
      taxe: "Taxe",
      salaire: "Salaire",
      autre: "Autre",
    };
    return categories[categorie] || categorie;
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const vehicleName = transaction.vehiculeId ? vehicleMap[transaction.vehiculeId] : "";
    const clientName = transaction.clientId ? clientMap[transaction.clientId] : "";
    const categoryLabel = getCategoryLabel(transaction.categorie).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      vehicleName.toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower) ||
      categoryLabel.includes(searchLower) ||
      (transaction.description && transaction.description.toLowerCase().includes(searchLower));

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && transaction.type === activeTab;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const stats = transactions.reduce(
    (acc, transaction) => {
      const amount = parseFloat(transaction.montant.toString());
      if (transaction.type === "recette") {
        acc.totalRevenue += amount;
      } else {
        acc.totalExpense += amount;
      }
      return acc;
    },
    { totalRevenue: 0, totalExpense: 0 }
  );

  const balance = stats.totalRevenue - stats.totalExpense;

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
          <h1 className="text-3xl font-bold">Trésorerie</h1>
          <p className="text-muted-foreground">
            {transactions.length} transactions
          </p>
        </div>
        <AddTransactionDialog
          trigger={
            <Button data-testid="button-add-transaction">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Transaction
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Recettes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Solde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par véhicule, client, catégorie ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-transaction"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">Tous</TabsTrigger>
          <TabsTrigger value="recette" data-testid="tab-recette">Recettes</TabsTrigger>
          <TabsTrigger value="depense" data-testid="tab-depense">Dépenses</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => (
              <Card key={transaction.id} data-testid={`card-transaction-${transaction.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={transaction.type === "recette" ? "default" : "outline"}
                          className={transaction.type === "recette" 
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" 
                            : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                          }
                        >
                          {transaction.type === "recette" ? "Recette" : "Dépense"}
                        </Badge>
                        <span className="text-sm font-medium">{getCategoryLabel(transaction.categorie)}</span>
                        <span className="text-sm text-muted-foreground">{formatDate(transaction.date)}</span>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {transaction.vehiculeId && (
                          <span>🚗 {vehicleMap[transaction.vehiculeId]}</span>
                        )}
                        {transaction.clientId && (
                          <span>👤 {clientMap[transaction.clientId]}</span>
                        )}
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${transaction.type === "recette" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "recette" ? "+" : "-"}{formatCurrency(transaction.montant)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedTransactions.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune transaction trouvée</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
