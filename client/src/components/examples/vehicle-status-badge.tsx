import { VehicleStatusBadge } from '../vehicle-status-badge';

export default function VehicleStatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-6">
      <VehicleStatusBadge status="disponible" />
      <VehicleStatusBadge status="en_location" />
      <VehicleStatusBadge status="en_maintenance" />
      <VehicleStatusBadge status="hors_service" />
    </div>
  );
}
