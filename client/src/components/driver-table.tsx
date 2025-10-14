import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Driver {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  vehiculeAssigne?: string;
  status: "actif" | "inactif" | "conge";
}

interface DriverTableProps {
  drivers: Driver[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  actif: {
    label: "Actif",
    className: "bg-chart-2 text-white hover:bg-chart-2/90",
  },
  inactif: {
    label: "Inactif",
    className: "bg-muted text-muted-foreground",
  },
  conge: {
    label: "En congé",
    className: "bg-chart-3 text-white hover:bg-chart-3/90",
  },
};

export function DriverTable({ drivers, onView, onEdit, onDelete }: DriverTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chauffeur</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Véhicule assigné</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => {
            const initials = `${driver.prenom[0]}${driver.nom[0]}`.toUpperCase();
            const config = statusConfig[driver.status];
            
            return (
              <TableRow key={driver.id} data-testid={`row-driver-${driver.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{driver.prenom} {driver.nom}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{driver.telephone}</TableCell>
                <TableCell>
                  {driver.vehiculeAssigne || (
                    <span className="text-muted-foreground">Non assigné</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="default" className={config.className}>
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView?.(driver.id)}
                      data-testid={`button-view-driver-${driver.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(driver.id)}
                      data-testid={`button-edit-driver-${driver.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(driver.id)}
                      data-testid={`button-delete-driver-${driver.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
