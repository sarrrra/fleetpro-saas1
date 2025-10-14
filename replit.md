# FleetPro - Application SaaS B2B de Gestion de Parc Automobile

## Vue d'ensemble
FleetPro est une application web multi-tenant permettant aux entreprises de gérer leur parc automobile (voitures, utilitaires, camions, bus, engins). L'application supporte la gestion de véhicules, chauffeurs, clients, suivi de carburant, planification de maintenance, trésorerie et facturation.

## Architecture Technique

### Stack Technologique
- **Frontend**: React 18 + TypeScript avec Vite
- **Backend**: Express.js + Node.js
- **Base de données**: PostgreSQL (Neon) avec Drizzle ORM
- **Authentification**: Replit Auth (OpenID Connect)
- **UI**: Shadcn/UI + Tailwind CSS + Dark mode
- **State Management**: TanStack Query v5

### Architecture Multi-Tenant
L'application utilise une architecture multi-tenant avec isolation complète des données au niveau de l'organisation:
- Chaque utilisateur appartient à une organisation (tenant)
- Toutes les requêtes API filtrent automatiquement par `organizationId`
- Les rôles utilisateur: `super_admin`, `admin_entreprise`, `gestionnaire`, `chauffeur`

## Structure de la Base de Données

### Tables Principales
1. **organizations** - Organisations/tenants (entreprises clientes)
2. **users** - Utilisateurs avec rôles et lien vers Replit Auth
3. **vehicles** - Véhicules du parc automobile
4. **drivers** - Chauffeurs
5. **clients** - Clients (pour agences de location)
6. **fuel_records** - Enregistrements de carburant
7. **maintenance_records** - Planification et suivi d'entretien
8. **transactions** - Transactions financières (recettes/dépenses)
9. **invoices** - Factures clients
10. **sessions** - Sessions utilisateur (Replit Auth)

### Isolation des Données
Chaque table (sauf `users` et `organizations`) contient un champ `organizationId` pour garantir l'isolation des données entre tenants.

## Fonctionnalités Implémentées

### Authentification
- ✅ Connexion via Replit Auth (Google, GitHub, Email)
- ✅ Gestion de session avec PostgreSQL
- ✅ Auto-création d'organisation au premier login
- ✅ Protection des routes API avec `isAuthenticated` middleware
- ✅ Rafraîchissement automatique des tokens

### Dashboard
- ✅ KPIs en temps réel (véhicules actifs, chauffeurs, entretiens, revenus)
- ✅ Alertes d'entretien urgent/bientôt
- ✅ Véhicules récents
- ✅ Interface French/Dark mode

### Gestion des Véhicules
- ✅ Liste complète avec filtres (statut, recherche)
- ✅ Ajout de véhicule (marque, modèle, type, kilométrage, heures)
- ✅ Suppression de véhicule
- ✅ Statuts: disponible, en_location, en_maintenance, hors_service
- ✅ Types: voiture, utilitaire, camion, bus, engin

### Gestion des Chauffeurs
- ✅ Page de liste (structure en place)
- 🔄 CRUD complet à finaliser

### Pages Principales
- ✅ Landing page (non authentifié)
- ✅ Dashboard (authentifié)
- ✅ Véhicules (authentifié)
- ✅ Chauffeurs (authentifié)

## API Routes

### Authentification
- `GET /api/auth/user` - Récupérer l'utilisateur connecté
- `GET /api/login` - Initier le login Replit
- `GET /api/logout` - Se déconnecter
- `GET /api/callback` - Callback OAuth

### Véhicules
- `GET /api/vehicles` - Liste des véhicules (filtré par org)
- `POST /api/vehicles` - Créer un véhicule
- `PATCH /api/vehicles/:id` - Modifier un véhicule
- `DELETE /api/vehicles/:id` - Supprimer un véhicule

### Chauffeurs
- `GET /api/drivers` - Liste des chauffeurs
- `POST /api/drivers` - Créer un chauffeur
- `PATCH /api/drivers/:id` - Modifier un chauffeur
- `DELETE /api/drivers/:id` - Supprimer un chauffeur

### Dashboard
- `GET /api/dashboard/stats` - Statistiques du dashboard

### Autres endpoints
- Clients, Carburant, Maintenance, Transactions, Factures (implémentés côté backend)

## Changements Récents (Octobre 2024)

### Dernière Session
1. ✅ Implémentation complète de Replit Auth avec multi-tenant
2. ✅ Connexion frontend-backend avec données réelles
3. ✅ Dashboard fonctionnel avec stats en temps réel
4. ✅ Page Véhicules avec CRUD complet
5. ✅ Landing page pour utilisateurs non authentifiés
6. ✅ Gestion d'erreurs 401 avec redirection

## Prochaines Étapes
1. 🔄 Tests end-to-end avec Playwright
2. 🔄 Finaliser CRUD chauffeurs
3. 🔄 Implémenter gestion clients
4. 🔄 Implémenter suivi carburant
5. 🔄 Implémenter planification maintenance
6. 🔄 Implémenter trésorerie et facturation

## Navigation de l'Application

### Routes Frontend
- `/` - Landing page (non auth) ou Dashboard (auth)
- `/vehicules` - Gestion des véhicules
- `/chauffeurs` - Gestion des chauffeurs

### Composants Clés
- `AppSidebar` - Navigation principale
- `AddVehicleDialog` - Dialogue d'ajout de véhicule
- `VehicleCard` - Carte véhicule
- `StatCard` - Carte statistique
- `MaintenanceAlert` - Alerte d'entretien

## Configuration
- Port: 5000 (frontend + backend)
- Base de données: PostgreSQL via `DATABASE_URL`
- Session: Stockée en PostgreSQL (`SESSION_SECRET`)
- Thème: Dark mode par défaut

## Commandes Utiles
```bash
npm run dev          # Démarrer l'application
npm run db:push      # Synchroniser le schéma DB
npm run db:studio    # Ouvrir Drizzle Studio
```
