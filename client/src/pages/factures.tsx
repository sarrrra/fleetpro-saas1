import { AddInvoiceDialog } from "@/components/add-invoice-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Invoice, Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function Factures() {
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const clientMap = clients.reduce((acc, client) => {
    acc[client.id] = client.nom;
    return acc;
  }, {} as Record<string, string>);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  type InvoiceWithClient = Invoice & { clientNom: string };

  const invoicesWithClients: InvoiceWithClient[] = invoices.map((invoice) => ({
    ...invoice,
    clientNom: clientMap[invoice.clientId] || 'Inconnu',
  }));

  const columns: ColumnDef<InvoiceWithClient>[] = [
    {
      accessorKey: "numeroFacture",
      header: "N° Facture",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("numeroFacture")}</div>
      ),
    },
    {
      accessorKey: "clientNom",
      header: "Client",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return formatDate(date);
      },
    },
    {
      accessorKey: "dateEcheance",
      header: "Échéance",
      cell: ({ row }) => {
        const date = row.getValue("dateEcheance") as string | null;
        return formatDate(date);
      },
    },
    {
      accessorKey: "montantTotal",
      header: "Montant Total",
      cell: ({ row }) => {
        const montant = row.getValue("montantTotal") as string;
        return <span className="font-medium">{formatCurrency(montant)}</span>;
      },
    },
    {
      accessorKey: "montantPaye",
      header: "Montant Payé",
      cell: ({ row }) => {
        const montant = row.getValue("montantPaye") as string;
        return <span className="text-green-600">{formatCurrency(montant)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        switch (status) {
          case "impayee":
            return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"><AlertCircle className="h-3 w-3 mr-1" />Impayée</Badge>;
          case "payee_partiellement":
            return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Partielle</Badge>;
          case "payee":
            return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Payée</Badge>;
          default:
            return <Badge variant="outline">{status}</Badge>;
        }
      },
    },
  ];

  const stats = invoices.reduce(
    (acc, invoice) => {
      const total = parseFloat(invoice.montantTotal.toString());
      const paye = parseFloat(invoice.montantPaye.toString());
      
      acc.totalAmount += total;
      acc.paidAmount += paye;
      
      if (invoice.status === "impayee") acc.unpaidCount++;
      else if (invoice.status === "payee_partiellement") acc.partialCount++;
      else if (invoice.status === "payee") acc.paidCount++;
      
      return acc;
    },
    { totalAmount: 0, paidAmount: 0, unpaidCount: 0, partialCount: 0, paidCount: 0 }
  );

  const pendingAmount = stats.totalAmount - stats.paidAmount;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturation</h1>
          <p className="text-muted-foreground">
            {invoices.length} facture(s)
          </p>
        </div>
        <AddInvoiceDialog
          trigger={
            <Button data-testid="button-add-invoice">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Facture
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Montant Payé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(pendingAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Impayées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unpaidCount}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={invoicesWithClients}
        searchPlaceholder="Rechercher par numéro ou client..."
      />
    </div>
  );
}
