# FleetPro - Application SaaS B2B de Gestion de Parc Automobile

## Overview
FleetPro is a multi-tenant web application designed for businesses to manage their vehicle fleets (cars, utility vehicles, trucks, buses, heavy machinery). It supports comprehensive management of vehicles, drivers, clients, fuel tracking, maintenance planning, treasury, and invoicing. The project aims to provide a robust, scalable, and user-friendly solution for fleet management, enhancing operational efficiency and financial tracking for businesses.

## User Preferences
Je préfère des explications claires et simples. J'aime le développement itératif et veux être consulté avant des changements architecturaux majeurs. Je valorise les explications détaillées pour les fonctionnalités complexes. Assurez des tests robustes et maintenez un haut standard de qualité de code.

## System Architecture

### Technical Stack
- **Frontend**: React 18 + TypeScript with Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **UI**: Shadcn/UI + Tailwind CSS + Dark mode
- **State Management**: TanStack Query v5

### Multi-Tenant Architecture
The application employs a multi-tenant architecture with complete data isolation per organization:
- Each user belongs to an organization (tenant).
- All API requests automatically filter by `organizationId`.
- User roles include: `super_admin`, `admin_entreprise`, `gestionnaire`, `chauffeur`.

### Database Schema
Key tables include: `organizations`, `users`, `invitations`, `vehicles`, `drivers`, `clients`, `fuel_records`, `maintenance_records`, `transactions`, `invoices`, `organization_settings`, and `sessions`. Data isolation is ensured by an `organizationId` field in most tables.

### UI/UX Decisions
- Interactive tables with search, sort, and pagination (TanStack Table).
- Responsive design for mobile and tablet devices.
- Consistent French language interface with dark mode support.
- Colored badges for status indications (e.g., maintenance urgency, client balance).

### Feature Specifications
- **Authentication**: Secure login via Replit Auth, session management, auto-organization creation, protected API routes, and an invitation system for new administrators.
- **Dashboard**: Real-time KPIs, urgent alerts, and recent activity overview.
- **CRUD Operations**: Comprehensive creation, reading, updating, and deletion for vehicles, drivers, clients, fuel records, maintenance schedules, financial transactions, and invoices.
- **Configuration**: Company settings, user and role administration, and UI customization.
- **Super Admin Module**: Global organization management, subscription tracking, and granular feature flag control per organization.
- **Invitation System**: Secure, token-based invitation flow for new administrators with automatic user-organization association post-login.

### System Design Choices
- **Data Isolation**: `organizationId` is central to ensuring tenant data separation.
- **Role-Based Access Control (RBAC)**: Middleware (`isAuthenticated`, `isSuperAdmin`) enforces access policies.
- **Feature Flags**: Granular control over features per organization via `organization_settings`.
- **Scalability**: Designed to support multiple tenants with isolated data.

## External Dependencies
- **Replit Auth**: Primary authentication and identity provider using OpenID Connect.
- **Neon (PostgreSQL)**: Managed PostgreSQL database service.
- **Drizzle ORM**: Type-safe ORM used for interacting with the PostgreSQL database.