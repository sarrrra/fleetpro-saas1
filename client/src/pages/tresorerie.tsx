import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Transaction, Vehicle, Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function Tresorerie() {
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
    acc[vehicle.id] = `${vehicle.immatriculation}`;
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

  type TransactionWithNames = Transaction & {
    vehiculeNom?: string;
    clientNom?: string;
  };

  const transactionsWithNames: TransactionWithNames[] = transactions.map((transaction) => ({
    ...transaction,
    vehiculeNom: transaction.vehiculeId ? vehicleMap[transaction.vehiculeId] : undefined,
    clientNom: transaction.clientId ? clientMap[transaction.clientId] : undefined,
  }));

  const columns: ColumnDef<TransactionWithNames>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return formatDate(date);
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return type === "recette" ? (
          <Badge variant="default" className="bg-green-600">Recette</Badge>
        ) : (
          <Badge variant="destructive">Dépense</Badge>
        );
      },
    },
    {
      accessorKey: "categorie",
      header: "Catégorie",
      cell: ({ row }) => {
        const cat = row.getValue("categorie") as string;
        return getCategoryLabel(cat);
      },
    },
    {
      accessorKey: "vehiculeNom",
      header: "Véhicule",
      cell: ({ row }) => {
        const vehicule = row.getValue("vehiculeNom") as string | undefined;
        return vehicule || <span className="text-muted-foreground text-sm">-</span>;
      },
    },
    {
      accessorKey: "clientNom",
      header: "Client",
      cell: ({ row }) => {
        const client = row.getValue("clientNom") as string | undefined;
        return client || <span className="text-muted-foreground text-sm">-</span>;
      },
    },
    {
      accessorKey: "montant",
      header: "Montant",
      cell: ({ row }) => {
        const montant = row.getValue("montant") as string;
        const type = row.original.type;
        return (
          <span className={`font-medium ${type === "recette" ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(montant)}
          </span>
        );
      },
    },
  ];

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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Trésorerie</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {transactions.length} transaction(s)
          </p>
        </div>
        <AddTransactionDialog
          trigger={
            <Button data-testid="button-add-transaction">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Nouvelle </span>Transaction
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

      <DataTable
        columns={columns}
        data={transactionsWithNames}
        searchPlaceholder="Rechercher par catégorie, véhicule, client..."
      />
    </div>
  );
}
