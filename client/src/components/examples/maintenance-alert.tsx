import { MaintenanceAlert } from '../maintenance-alert';

export default function MaintenanceAlertExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <MaintenanceAlert
        vehicleId="1"
        immatriculation="AB-123-CD"
        type="Vidange moteur"
        dueDate="15/10/2024"
        kilometrage={50000}
        urgency="urgent"
        onSchedule={(id) => console.log('Schedule maintenance for', id)}
      />
      <MaintenanceAlert
        vehicleId="2"
        immatriculation="EF-456-GH"
        type="Remplacement filtres"
        dueDate="25/10/2024"
        kilometrage={120500}
        urgency="soon"
        onSchedule={(id) => console.log('Schedule maintenance for', id)}
      />
      <MaintenanceAlert
        vehicleId="3"
        immatriculation="IJ-789-KL"
        type="Contrôle technique"
        dueDate="05/11/2024"
        kilometrage={78000}
        urgency="scheduled"
        onSchedule={(id) => console.log('Schedule maintenance for', id)}
      />
    </div>
  );
}
