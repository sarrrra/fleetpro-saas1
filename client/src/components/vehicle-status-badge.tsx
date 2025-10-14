import { Badge } from "@/components/ui/badge";

export type VehicleStatus = "disponible" | "en_location" | "en_maintenance" | "hors_service";

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
}

const statusConfig = {
  disponible: {
    label: "Disponible",
    variant: "default" as const,
    className: "bg-chart-2 text-white hover:bg-chart-2/90",
  },
  en_location: {
    label: "En location",
    variant: "default" as const,
    className: "bg-chart-1 text-white hover:bg-chart-1/90",
  },
  en_maintenance: {
    label: "En maintenance",
    variant: "default" as const,
    className: "bg-chart-3 text-white hover:bg-chart-3/90",
  },
  hors_service: {
    label: "Hors service",
    variant: "default" as const,
    className: "bg-chart-5 text-white hover:bg-chart-5/90",
  },
};

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant} 
      className={config.className}
      data-testid={`badge-vehicle-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
