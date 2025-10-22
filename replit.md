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
10. **organization_settings** - Paramètres et personnalisation des organisations
11. **sessions** - Sessions utilisateur (Replit Auth)

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
- ✅ **Tableau interactif** avec recherche, tri, pagination (TanStack Table)
- ✅ Colonnes: Marque, Modèle, Type, Immatriculation, Kilométrage, Statut, Actions
- ✅ Actions inline: Modifier, Supprimer (avec confirmation)
- ✅ Ajout de véhicule (marque, modèle, type, kilométrage, heures)
- ✅ Statuts: disponible, en_location, en_maintenance, hors_service
- ✅ Types: voiture, utilitaire, camion, bus, engin

### Gestion des Chauffeurs
- ✅ **Tableau interactif** avec recherche, tri, pagination
- ✅ Colonnes: Nom, Prénom, Téléphone, Véhicule Assigné, Actions
- ✅ Actions inline: Modifier, Supprimer (avec confirmation)
- ✅ CRUD complet avec assignation véhicule

### Gestion des Clients
- ✅ **Tableau interactif** avec recherche, tri, pagination
- ✅ Colonnes: Nom, Entreprise, Téléphone, Email, Solde, Actions
- ✅ Actions inline: Modifier, Supprimer (avec confirmation)
- ✅ CRUD complet avec suivi de solde
- ✅ Badge coloré pour solde positif/négatif

### Suivi Carburant
- ✅ **Tableau interactif** avec recherche, tri, pagination
- ✅ Colonnes: Date, Véhicule, Chauffeur, Kilométrage, Quantité, Prix/L, Coût Total
- ✅ Statistiques en temps réel (coût total, quantité totale, prix moyen/L)
- ✅ Enregistrements avec détails complets

### Planification Maintenance
- ✅ **Tableau interactif** avec recherche, tri, pagination
- ✅ Colonnes: Véhicule, Type, Date Prévue, Kilométrage, Urgence, Coût
- ✅ Badges colorés par urgence (urgent/bientôt/planifié/terminé)
- ✅ Statistiques en temps réel (planifiés, bientôt, urgent, terminés)
- ✅ Création avec urgence et suivi par kilométrage/heures

### Trésorerie
- ✅ **Tableau interactif** avec recherche, tri, pagination
- ✅ Colonnes: Date, Type, Catégorie, Véhicule, Client, Montant
- ✅ Badges colorés par type (recette/dépense)
- ✅ Statistiques en temps réel (recettes, dépenses, solde)
- ✅ Transactions recettes/dépenses avec catégories

### Facturation
- ✅ **Tableau interactif** avec recherche, tri, pagination
- ✅ Colonnes: N° Facture, Client, Date, Échéance, Montant Total, Montant Payé, Statut
- ✅ Badges colorés par statut (impayée/partielle/payée)
- ✅ Statistiques en temps réel (montant total, montant payé, en attente, impayées)
- ✅ Factures avec échéances et suivi paiements

### Configuration
- ✅ **Paramètres entreprise** - Registre commerce, NIS, NIF, article imposition, adresse
- ✅ **Administration** - Gestion utilisateurs et rôles
- ✅ **Personnalisation** - Couleurs thème, logo entreprise

### Pages Principales
- ✅ Landing page (non authentifié)
- ✅ Dashboard (authentifié)
- ✅ Véhicules, Chauffeurs, Clients
- ✅ Carburant, Maintenance, Trésorerie, Factures
- ✅ Paramètres, Administration, Personnalisation

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

### Configuration
- `GET /api/settings` - Récupérer paramètres organisation
- `PUT /api/settings` - Modifier paramètres organisation
- `GET /api/users` - Liste utilisateurs organisation
- `PATCH /api/users/:id` - Modifier rôle utilisateur
- `DELETE /api/users/:id` - Supprimer utilisateur

### Autres endpoints
- Clients, Carburant, Maintenance, Transactions, Factures (tous implémentés)

## Changements Récents (Octobre 2024)

### Session Actuelle - Design Responsive Mobile/Tablette (Octobre 22, 2024)
1. ✅ **Layout principal responsive** - Padding adaptatif `px-4 sm:px-6 lg:px-8 py-4 sm:py-6`
2. ✅ **Headers de pages responsive** - Layout flex-col sur mobile → flex-row sur desktop
3. ✅ **DataTable mobile-friendly** - Scroll horizontal avec `overflow-x-auto` + pagination responsive
4. ✅ **Grilles de statistiques adaptatives** - 1 colonne mobile → 2-4 colonnes desktop selon contexte
5. ✅ **Boutons adaptatifs** - Texte court sur mobile (`hidden xs:inline`) → texte complet sur desktop
6. ✅ **Sidebar auto-collapse** - Collapsed sur mobile, expanded sur desktop via SidebarProvider
7. ✅ **Breakpoints Tailwind** - sm:640px, md:768px, lg:1024px utilisés de manière cohérente
8. ✅ **Tests E2E responsive** - Validé sur 5 tailles d'écran (375px, 428px, 768px, 1280px, 1920px)
9. ✅ **8 pages responsive** - Dashboard, Véhicules, Chauffeurs, Clients, Carburant, Maintenance, Trésorerie, Factures

### Session Précédente - Conversion en Tableaux (Octobre 22, 2024)
1. ✅ Création composant DataTable réutilisable avec TanStack Table
2. ✅ Conversion de toutes les pages en vue tableau avec recherche, tri et pagination
3. ✅ Pages converties : Véhicules, Chauffeurs, Clients, Carburant, Maintenance, Trésorerie, Factures
4. ✅ Actions inline (modifier/supprimer) avec AlertDialog de confirmation
5. ✅ Tests end-to-end validés pour toutes les vues tableau

### Session Précédente (Octobre 2024)
1. ✅ Tous les 7 modules opérationnels complétés
2. ✅ Module Configuration ajouté (Paramètres, Administration, Personnalisation)
3. ✅ Tests end-to-end Playwright validés pour tous les modules
4. ✅ Corrections bugs : routes /entretien, validation dates, SelectItem vides
5. ✅ Table organization_settings créée avec infos légales et personnalisation

### Modules Complets
- ✅ Véhicules, Chauffeurs, Clients (CRUD complet avec tableaux interactifs)
- ✅ Carburant, Maintenance, Trésorerie, Factures (tableaux interactifs + statistiques)
- ✅ Configuration : Paramètres entreprise, Administration utilisateurs, Personnalisation thème

## Prochaines Étapes
1. 🔄 Optimisations UX (modals, toasts)
2. 🔄 Rapports et exports PDF
3. 🔄 Notifications et alertes
4. 🔄 Dashboard analytics avancé

## Navigation de l'Application

### Routes Frontend
- `/` - Landing page (non auth) ou Dashboard (auth)
- `/vehicules` - Gestion des véhicules
- `/chauffeurs` - Gestion des chauffeurs

### Composants Clés
- `AppSidebar` - Navigation principale
- `DataTable` - Tableau réutilisable avec recherche, tri, pagination (TanStack Table)
- `AddVehicleDialog`, `AddDriverDialog`, etc. - Dialogues d'ajout d'entités
- `EditVehicleDialog`, `EditDriverDialog`, etc. - Dialogues de modification
- `StatCard` - Carte statistique pour KPIs
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
