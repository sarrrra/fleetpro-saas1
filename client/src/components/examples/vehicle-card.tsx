import { VehicleCard } from '../vehicle-card';

export default function VehicleCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <VehicleCard
        id="1"
        immatriculation="AB-123-CD"
        modele="Renault Trafic"
        type="Utilitaire"
        kilometrage={45000}
        status="disponible"
        onView={(id) => console.log('View vehicle', id)}
        onEdit={(id) => console.log('Edit vehicle', id)}
        onDelete={(id) => console.log('Delete vehicle', id)}
      />
      <VehicleCard
        id="2"
        immatriculation="EF-456-GH"
        modele="Mercedes Sprinter"
        type="Camion"
        kilometrage={120000}
        status="en_location"
        onView={(id) => console.log('View vehicle', id)}
        onEdit={(id) => console.log('Edit vehicle', id)}
        onDelete={(id) => console.log('Delete vehicle', id)}
      />
      <VehicleCard
        id="3"
        immatriculation="IJ-789-KL"
        modele="Peugeot 308"
        type="Voiture"
        kilometrage={78000}
        status="en_maintenance"
        onView={(id) => console.log('View vehicle', id)}
        onEdit={(id) => console.log('Edit vehicle', id)}
        onDelete={(id) => console.log('Delete vehicle', id)}
      />
    </div>
  );
}
