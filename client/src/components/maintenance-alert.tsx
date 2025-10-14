import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MaintenanceAlertProps {
  vehicleId: string;
  immatriculation: string;
  type: string;
  dueDate: string;
  kilometrage: number;
  urgency: "urgent" | "soon" | "scheduled";
  onSchedule?: (vehicleId: string) => void;
}

const urgencyConfig = {
  urgent: {
    label: "Urgent",
    className: "bg-chart-5 text-white hover:bg-chart-5/90",
  },
  soon: {
    label: "Bientôt",
    className: "bg-chart-3 text-white hover:bg-chart-3/90",
  },
  scheduled: {
    label: "Planifié",
    className: "bg-chart-2 text-white hover:bg-chart-2/90",
  },
};

export function MaintenanceAlert({
  vehicleId,
  immatriculation,
  type,
  dueDate,
  kilometrage,
  urgency,
  onSchedule,
}: MaintenanceAlertProps) {
  const config = urgencyConfig[urgency];

  return (
    <Card className="hover-elevate" data-testid={`card-maintenance-${vehicleId}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${urgency === 'urgent' ? 'bg-chart-5/10' : urgency === 'soon' ? 'bg-chart-3/10' : 'bg-chart-2/10'}`}>
            <Wrench className={`h-5 w-5 ${urgency === 'urgent' ? 'text-chart-5' : urgency === 'soon' ? 'text-chart-3' : 'text-chart-2'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{immatriculation}</h3>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
        </div>
        <Badge variant="default" className={config.className}>
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Date prévue:</span>
          <span className="font-medium">{dueDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Kilométrage:</span>
          <span className="font-medium">{kilometrage.toLocaleString()} km</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={() => onSchedule?.(vehicleId)}
          data-testid={`button-schedule-maintenance-${vehicleId}`}
        >
          Planifier l'entretien
        </Button>
      </CardContent>
    </Card>
  );
}
