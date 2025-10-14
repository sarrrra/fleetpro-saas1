import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VehicleStatusBadge, VehicleStatus } from "./vehicle-status-badge";
import { Eye, Edit, Trash2, Gauge, Calendar } from "lucide-react";

interface VehicleCardProps {
  id: string;
  immatriculation: string;
  modele: string;
  type: string;
  kilometrage: number;
  status: VehicleStatus;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function VehicleCard({
  id,
  immatriculation,
  modele,
  type,
  kilometrage,
  status,
  onView,
  onEdit,
  onDelete,
}: VehicleCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-vehicle-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate" data-testid={`text-vehicle-immat-${id}`}>
            {immatriculation}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{modele}</p>
        </div>
        <VehicleStatusBadge status={status} />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Kilométrage:</span>
          <span className="font-medium">{kilometrage.toLocaleString()} km</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">{type}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onView?.(id)}
          data-testid={`button-view-vehicle-${id}`}
        >
          <Eye className="h-4 w-4 mr-1" />
          Voir
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit?.(id)}
          data-testid={`button-edit-vehicle-${id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete?.(id)}
          data-testid={`button-delete-vehicle-${id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
