import { useState } from "react";
import { AddMaintenanceDialog } from "@/components/add-maintenance-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Wrench, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { MaintenanceRecord, Vehicle } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Maintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: maintenanceRecords = [], isLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = `${vehicle.immatriculation} - ${vehicle.marque} ${vehicle.modele}`;
    return acc;
  }, {} as Record<string, string>);

  const getStatusBadge = (record: MaintenanceRecord) => {
    if (record.complete) {
      return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" data-testid={`badge-termine`}><CheckCircle2 className="h-3 w-3 mr-1" />Terminé</Badge>;
    }
    
    switch (record.urgency) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" data-testid={`badge-planifie`}><Clock className="h-3 w-3 mr-1" />Planifié</Badge>;
      case "soon":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" data-testid={`badge-bientot`}><AlertTriangle className="h-3 w-3 mr-1" />Bientôt</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" data-testid={`badge-urgent`}><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>;
      default:
        return <Badge variant="outline">{record.urgency}</Badge>;
    }
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

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getMaintenanceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      vidange: "Vidange",
      filtres: "Filtres",
      pneus: "Pneus",
      freins: "Freins",
      batterie: "Batterie",
      courroie: "Courroie",
      revision: "Révision",
      autre: "Autre",
    };
    return types[type] || type;
  };

  const filteredRecords = maintenanceRecords.filter((record) => {
    const vehicleName = vehicleMap[record.vehiculeId] || "";
    const searchLower = searchTerm.toLowerCase();
    const typeLabel = getMaintenanceTypeLabel(record.type).toLowerCase();
    
    const matchesSearch = 
      vehicleName.toLowerCase().includes(searchLower) ||
      typeLabel.includes(searchLower) ||
      (record.description && record.description.toLowerCase().includes(searchLower));

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "complete") return matchesSearch && record.complete;
    if (activeTab === "pending") return matchesSearch && !record.complete;
    return matchesSearch && record.urgency === activeTab;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const dateA = a.datePrevu ? new Date(a.datePrevu).getTime() : 0;
    const dateB = b.datePrevu ? new Date(b.datePrevu).getTime() : 0;
    return dateB - dateA;
  });

  const stats = {
    scheduled: maintenanceRecords.filter(r => !r.complete && r.urgency === "scheduled").length,
    soon: maintenanceRecords.filter(r => !r.complete && r.urgency === "soon").length,
    urgent: maintenanceRecords.filter(r => !r.complete && r.urgency === "urgent").length,
    complete: maintenanceRecords.filter(r => r.complete).length,
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
          <h1 className="text-3xl font-bold">Planification Maintenance</h1>
          <p className="text-muted-foreground">
            {maintenanceRecords.length} enregistrements
          </p>
        </div>
        <AddMaintenanceDialog
          trigger={
            <Button data-testid="button-add-maintenance">
              <Plus className="h-4 w-4 mr-2" />
              Planifier Maintenance
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Planifiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bientôt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complete}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par véhicule, type ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-maintenance"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">Tous</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">En attente</TabsTrigger>
          <TabsTrigger value="complete" data-testid="tab-complete">Terminés</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {sortedRecords.map((record) => (
              <Card key={record.id} data-testid={`card-maintenance-${record.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {getMaintenanceTypeLabel(record.type)}
                        </h3>
                        {getStatusBadge(record)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vehicleMap[record.vehiculeId] || 'Véhicule inconnu'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {record.description && (
                    <p className="text-sm mb-4">{record.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date prévue</p>
                      <p className="font-medium">{formatDate(record.datePrevu)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date réalisée</p>
                      <p className="font-medium">{formatDate(record.dateRealise)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Km prévu</p>
                      <p className="font-medium">
                        {record.kilometragePrevu ? `${record.kilometragePrevu.toLocaleString('fr-FR')} km` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coût</p>
                      <p className="font-medium">{formatCurrency(record.cout)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedRecords.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun enregistrement de maintenance trouvé</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
