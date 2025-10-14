import { StatCard } from '../stat-card';
import { Car, Users, Wrench, TrendingUp } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      <StatCard
        title="Véhicules Actifs"
        value="24"
        icon={Car}
        trend={{ value: 12, isPositive: true }}
        description="Sur 30 véhicules total"
      />
      <StatCard
        title="Chauffeurs"
        value="18"
        icon={Users}
        description="Disponibles aujourd'hui"
      />
      <StatCard
        title="Entretiens Planifiés"
        value="6"
        icon={Wrench}
        trend={{ value: 5, isPositive: false }}
      />
      <StatCard
        title="Revenus Mensuel"
        value="45,230 €"
        icon={TrendingUp}
        trend={{ value: 8, isPositive: true }}
      />
    </div>
  );
}
