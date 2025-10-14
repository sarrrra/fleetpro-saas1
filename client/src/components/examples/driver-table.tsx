import { DriverTable } from '../driver-table';

const mockDrivers = [
  {
    id: "1",
    nom: "Dubois",
    prenom: "Jean",
    telephone: "06 12 34 56 78",
    vehiculeAssigne: "AB-123-CD",
    status: "actif" as const,
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Sophie",
    telephone: "06 98 76 54 32",
    vehiculeAssigne: "EF-456-GH",
    status: "actif" as const,
  },
  {
    id: "3",
    nom: "Bernard",
    prenom: "Pierre",
    telephone: "06 11 22 33 44",
    status: "conge" as const,
  },
  {
    id: "4",
    nom: "Petit",
    prenom: "Marie",
    telephone: "06 55 66 77 88",
    vehiculeAssigne: "IJ-789-KL",
    status: "actif" as const,
  },
];

export default function DriverTableExample() {
  return (
    <div className="p-6">
      <DriverTable
        drivers={mockDrivers}
        onView={(id) => console.log('View driver', id)}
        onEdit={(id) => console.log('Edit driver', id)}
        onDelete={(id) => console.log('Delete driver', id)}
      />
    </div>
  );
}
