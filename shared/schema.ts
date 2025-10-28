import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin_entreprise", "gestionnaire", "chauffeur"]);
export const vehicleStatusEnum = pgEnum("vehicle_status", ["disponible", "en_location", "en_maintenance", "hors_service"]);
export const driverStatusEnum = pgEnum("driver_status", ["actif", "inactif", "conge"]);
export const maintenanceUrgencyEnum = pgEnum("maintenance_urgency", ["urgent", "soon", "scheduled"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["recette", "depense"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["actif", "expire", "suspendu"]);

// Organizations (Tenants)
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: text("nom").notNull(),
  email: text("email").notNull(),
  telephone: text("telephone"),
  adresse: text("adresse"),
  nomGerant: text("nom_gerant"),
  prenomGerant: text("prenom_gerant"),
  emailGerant: text("email_gerant"),
  telephoneGerant: text("telephone_gerant"),
  dateDebutAbonnement: timestamp("date_debut_abonnement"),
  dateFinAbonnement: timestamp("date_fin_abonnement"),
  statutAbonnement: subscriptionStatusEnum("statut_abonnement").default("actif"),
  dernierRappelEnvoye: timestamp("dernier_rappel_envoye"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  replitAuthId: text("replit_auth_id").unique(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  email: text("email").notNull().unique(),
  telephone: text("telephone"),
  role: userRoleEnum("role").notNull().default("gestionnaire"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vehicles
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  immatriculation: text("immatriculation").notNull(),
  marque: text("marque").notNull(),
  modele: text("modele").notNull(),
  type: text("type").notNull(), // voiture, utilitaire, camion, bus, engin
  annee: integer("annee"),
  kilometrage: integer("kilometrage").default(0).notNull(),
  heuresTravail: integer("heures_travail").default(0),
  status: vehicleStatusEnum("status").default("disponible").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Drivers
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  telephone: text("telephone").notNull(),
  email: text("email"),
  numeroPermis: text("numero_permis"),
  dateExpirationPermis: timestamp("date_expiration_permis"),
  vehiculeAssigneId: varchar("vehicule_assigne_id").references(() => vehicles.id),
  status: driverStatusEnum("status").default("actif").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  nom: text("nom").notNull(),
  email: text("email"),
  telephone: text("telephone").notNull(),
  adresse: text("adresse"),
  entreprise: text("entreprise"),
  solde: decimal("solde", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fuel Records
export const fuelRecords = pgTable("fuel_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  vehiculeId: varchar("vehicule_id").references(() => vehicles.id).notNull(),
  chauffeurId: varchar("chauffeur_id").references(() => drivers.id),
  date: timestamp("date").defaultNow().notNull(),
  quantite: decimal("quantite", { precision: 10, scale: 2 }).notNull(),
  coutUnitaire: decimal("cout_unitaire", { precision: 10, scale: 2 }).notNull(),
  coutTotal: decimal("cout_total", { precision: 10, scale: 2 }).notNull(),
  kilometrage: integer("kilometrage").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Maintenance Records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  vehiculeId: varchar("vehicule_id").references(() => vehicles.id).notNull(),
  type: text("type").notNull(), // vidange, filtres, pneus, etc.
  description: text("description"),
  datePrevu: timestamp("date_prevu"),
  dateRealise: timestamp("date_realise"),
  kilometragePrevu: integer("kilometrage_prevu"),
  kilometrageRealise: integer("kilometrage_realise"),
  cout: decimal("cout", { precision: 10, scale: 2 }),
  urgency: maintenanceUrgencyEnum("urgency").default("scheduled").notNull(),
  complete: boolean("complete").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions (Treasury)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  categorie: text("categorie").notNull(),
  description: text("description"),
  vehiculeId: varchar("vehicule_id").references(() => vehicles.id),
  clientId: varchar("client_id").references(() => clients.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  numeroFacture: text("numero_facture").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  dateEcheance: timestamp("date_echeance"),
  montantTotal: decimal("montant_total", { precision: 10, scale: 2 }).notNull(),
  montantPaye: decimal("montant_paye", { precision: 10, scale: 2 }).default("0").notNull(),
  status: text("status").default("impayee").notNull(), // impayee, payee_partiellement, payee
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Organization Settings
export const organizationSettings = pgTable("organization_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull().unique(),
  // Informations légales
  registreCommerce: text("registre_commerce"),
  nis: text("nis"),
  nif: text("nif"),
  articleImposition: text("article_imposition"),
  // Informations entreprise
  nomComplet: text("nom_complet"),
  adresseComplete: text("adresse_complete"),
  ville: text("ville"),
  codePostal: text("code_postal"),
  pays: text("pays").default("Algérie"),
  telephone: text("telephone"),
  email: text("email"),
  siteWeb: text("site_web"),
  // Personnalisation
  logo: text("logo"), // URL ou base64
  couleurPrimaire: text("couleur_primaire").default("#2563eb"),
  couleurSecondaire: text("couleur_secondaire").default("#64748b"),
  // Feature Flags - Fonctionnalités activables/désactivables
  enabledFeatures: text("enabled_features").array().default(sql`ARRAY['vehicles', 'drivers', 'clients', 'fuel', 'maintenance', 'treasury', 'invoices']::text[]`).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invitations - Système d'invitation par email
export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  role: userRoleEnum("role").notNull().default("admin_entreprise"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdBy: varchar("created_by").references(() => users.id),
});

// Insert Schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true, createdAt: true }).extend({
  dateExpirationPermis: z.union([z.string(), z.date()]).optional().nullable().transform(val => val ? new Date(val) : null),
});
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertFuelRecordSchema = createInsertSchema(fuelRecords).omit({ id: true, createdAt: true }).extend({
  date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
});
export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({ id: true, createdAt: true }).extend({
  datePrevu: z.union([z.string(), z.date()]).optional().nullable().transform(val => val ? new Date(val) : null),
  dateRealise: z.union([z.string(), z.date()]).optional().nullable().transform(val => val ? new Date(val) : null),
});
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true }).extend({
  date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
});
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true }).extend({
  date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  dateEcheance: z.union([z.string(), z.date()]).optional().nullable().transform(val => val ? new Date(val) : null),
});
export const insertOrganizationSettingsSchema = createInsertSchema(organizationSettings).omit({ id: true, updatedAt: true });
export const insertInvitationSchema = createInsertSchema(invitations).omit({ id: true, createdAt: true, usedAt: true }).extend({
  expiresAt: z.union([z.string(), z.date()]).transform(val => new Date(val)),
});

// Types
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertFuelRecord = z.infer<typeof insertFuelRecordSchema>;
export type FuelRecord = typeof fuelRecords.$inferSelect;

export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertOrganizationSettings = z.infer<typeof insertOrganizationSettingsSchema>;
export type OrganizationSettings = typeof organizationSettings.$inferSelect;

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;
