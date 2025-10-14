import { useState } from "react";
import { AddInvoiceDialog } from "@/components/add-invoice-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Invoice, Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Factures() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "impayee":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" data-testid="badge-impayee"><AlertCircle className="h-3 w-3 mr-1" />Impayée</Badge>;
      case "payee_partiellement":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" data-testid="badge-partielle"><Clock className="h-3 w-3 mr-1" />Payée partiellement</Badge>;
      case "payee":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" data-testid="badge-payee"><CheckCircle2 className="h-3 w-3 mr-1" />Payée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = clientMap[invoice.clientId] || "";
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchLower) ||
      invoice.numeroFacture.toLowerCase().includes(searchLower);

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && invoice.status === activeTab;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturation</h1>
          <p className="text-muted-foreground">
            {invoices.length} factures
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par client ou numéro de facture..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-invoice"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">Toutes</TabsTrigger>
          <TabsTrigger value="impayee" data-testid="tab-impayee">Impayées</TabsTrigger>
          <TabsTrigger value="payee_partiellement" data-testid="tab-partielle">Partielles</TabsTrigger>
          <TabsTrigger value="payee" data-testid="tab-payee">Payées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {sortedInvoices.map((invoice) => {
              const montantRestant = parseFloat(invoice.montantTotal.toString()) - parseFloat(invoice.montantPaye.toString());
              
              return (
                <Card key={invoice.id} data-testid={`card-invoice-${invoice.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{invoice.numeroFacture}</h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Client: {clientMap[invoice.clientId] || 'Inconnu'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {invoice.notes && (
                      <p className="text-sm mb-4">{invoice.notes}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date d'émission</p>
                        <p className="font-medium">{formatDate(invoice.date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date d'échéance</p>
                        <p className="font-medium">{formatDate(invoice.dateEcheance)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Montant total</p>
                        <p className="font-medium">{formatCurrency(invoice.montantTotal)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Montant payé</p>
                        <p className="font-medium text-green-600">{formatCurrency(invoice.montantPaye)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Restant dû</p>
                        <p className={`font-medium ${montantRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(montantRestant)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {sortedInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune facture trouvée</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
