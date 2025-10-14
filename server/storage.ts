import {
  organizations,
  users,
  vehicles,
  drivers,
  clients,
  fuelRecords,
  maintenanceRecords,
  transactions,
  invoices,
  organizationSettings,
  type Organization,
  type User,
  type InsertUser,
  type Vehicle,
  type InsertVehicle,
  type Driver,
  type InsertDriver,
  type Client,
  type InsertClient,
  type FuelRecord,
  type InsertFuelRecord,
  type MaintenanceRecord,
  type InsertMaintenanceRecord,
  type Transaction,
  type InsertTransaction,
  type Invoice,
  type InsertInvoice,
  type OrganizationSettings,
  type InsertOrganizationSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

interface UpsertUserData {
  replitAuthId: string;
  email: string;
  nom: string;
  prenom: string;
}

export interface IStorage {
  // User operations (for Replit Auth)
  getUserByReplitAuthId(replitAuthId: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUserData): Promise<User>;
  
  // Organization operations
  getOrganizationById(id: string): Promise<Organization | undefined>;
  
  // Vehicle operations
  getVehiclesByOrganization(organizationId: string): Promise<Vehicle[]>;
  getVehicleById(id: string, organizationId: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, organizationId: string, data: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string, organizationId: string): Promise<void>;
  
  // Driver operations
  getDriversByOrganization(organizationId: string): Promise<Driver[]>;
  getDriverById(id: string, organizationId: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, organizationId: string, data: Partial<InsertDriver>): Promise<Driver>;
  deleteDriver(id: string, organizationId: string): Promise<void>;
  
  // Client operations
  getClientsByOrganization(organizationId: string): Promise<Client[]>;
  getClientById(id: string, organizationId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, organizationId: string, data: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string, organizationId: string): Promise<void>;
  
  // Fuel operations
  getFuelRecordsByOrganization(organizationId: string): Promise<FuelRecord[]>;
  getFuelRecordsByVehicle(vehicleId: string, organizationId: string): Promise<FuelRecord[]>;
  createFuelRecord(record: InsertFuelRecord): Promise<FuelRecord>;
  
  // Maintenance operations
  getMaintenanceRecordsByOrganization(organizationId: string): Promise<MaintenanceRecord[]>;
  getMaintenanceRecordsByVehicle(vehicleId: string, organizationId: string): Promise<MaintenanceRecord[]>;
  getUpcomingMaintenance(organizationId: string): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: string, organizationId: string, data: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord>;
  
  // Transaction operations
  getTransactionsByOrganization(organizationId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Invoice operations
  getInvoicesByOrganization(organizationId: string): Promise<Invoice[]>;
  getInvoicesByClient(clientId: string, organizationId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, organizationId: string, data: Partial<InsertInvoice>): Promise<Invoice>;
  
  // Organization settings operations
  getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | undefined>;
  upsertOrganizationSettings(settings: InsertOrganizationSettings): Promise<OrganizationSettings>;
  
  // User management operations
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: string, organizationId: string, role: string): Promise<User>;
  deleteUser(userId: string, organizationId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUserByReplitAuthId(replitAuthId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.replitAuthId, replitAuthId));
    return user;
  }

  async upsertUser(userData: UpsertUserData): Promise<User> {
    // Check if user exists
    const existingUser = await this.getUserByReplitAuthId(userData.replitAuthId);
    
    if (existingUser) {
      // Update existing user
      const [user] = await db
        .update(users)
        .set({
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
        })
        .where(eq(users.replitAuthId, userData.replitAuthId))
        .returning();
      return user;
    }

    // Create new organization and user
    const [organization] = await db
      .insert(organizations)
      .values({
        nom: `Entreprise ${userData.prenom} ${userData.nom}`,
        email: userData.email,
      })
      .returning();

    const [user] = await db
      .insert(users)
      .values({
        replitAuthId: userData.replitAuthId,
        organizationId: organization.id,
        email: userData.email,
        nom: userData.nom,
        prenom: userData.prenom,
        role: "admin_entreprise",
      })
      .returning();

    return user;
  }

  // Organization operations
  async getOrganizationById(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  // Vehicle operations
  async getVehiclesByOrganization(organizationId: string): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.organizationId, organizationId)).orderBy(desc(vehicles.createdAt));
  }

  async getVehicleById(id: string, organizationId: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: string, organizationId: string, data: Partial<InsertVehicle>): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set(data)
      .where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: string, organizationId: string): Promise<void> {
    await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)));
  }

  // Driver operations
  async getDriversByOrganization(organizationId: string): Promise<Driver[]> {
    return db.select().from(drivers).where(eq(drivers.organizationId, organizationId)).orderBy(desc(drivers.createdAt));
  }

  async getDriverById(id: string, organizationId: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(and(eq(drivers.id, id), eq(drivers.organizationId, organizationId)));
    return driver;
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [newDriver] = await db.insert(drivers).values(driver).returning();
    return newDriver;
  }

  async updateDriver(id: string, organizationId: string, data: Partial<InsertDriver>): Promise<Driver> {
    const [driver] = await db
      .update(drivers)
      .set(data)
      .where(and(eq(drivers.id, id), eq(drivers.organizationId, organizationId)))
      .returning();
    return driver;
  }

  async deleteDriver(id: string, organizationId: string): Promise<void> {
    await db.delete(drivers).where(and(eq(drivers.id, id), eq(drivers.organizationId, organizationId)));
  }

  // Client operations
  async getClientsByOrganization(organizationId: string): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.organizationId, organizationId)).orderBy(desc(clients.createdAt));
  }

  async getClientById(id: string, organizationId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, organizationId: string, data: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set(data)
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)))
      .returning();
    return client;
  }

  async deleteClient(id: string, organizationId: string): Promise<void> {
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)));
  }

  // Fuel operations
  async getFuelRecordsByOrganization(organizationId: string): Promise<FuelRecord[]> {
    return db.select().from(fuelRecords).where(eq(fuelRecords.organizationId, organizationId)).orderBy(desc(fuelRecords.date));
  }

  async getFuelRecordsByVehicle(vehicleId: string, organizationId: string): Promise<FuelRecord[]> {
    return db.select().from(fuelRecords).where(and(eq(fuelRecords.vehiculeId, vehicleId), eq(fuelRecords.organizationId, organizationId))).orderBy(desc(fuelRecords.date));
  }

  async createFuelRecord(record: InsertFuelRecord): Promise<FuelRecord> {
    const [newRecord] = await db.insert(fuelRecords).values(record).returning();
    return newRecord;
  }

  // Maintenance operations
  async getMaintenanceRecordsByOrganization(organizationId: string): Promise<MaintenanceRecord[]> {
    return db.select().from(maintenanceRecords).where(eq(maintenanceRecords.organizationId, organizationId)).orderBy(desc(maintenanceRecords.createdAt));
  }

  async getMaintenanceRecordsByVehicle(vehicleId: string, organizationId: string): Promise<MaintenanceRecord[]> {
    return db.select().from(maintenanceRecords).where(and(eq(maintenanceRecords.vehiculeId, vehicleId), eq(maintenanceRecords.organizationId, organizationId))).orderBy(desc(maintenanceRecords.createdAt));
  }

  async getUpcomingMaintenance(organizationId: string): Promise<MaintenanceRecord[]> {
    return db.select().from(maintenanceRecords).where(and(eq(maintenanceRecords.organizationId, organizationId), eq(maintenanceRecords.complete, false))).orderBy(maintenanceRecords.datePrevu);
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db.insert(maintenanceRecords).values(record).returning();
    return newRecord;
  }

  async updateMaintenanceRecord(id: string, organizationId: string, data: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord> {
    const [record] = await db
      .update(maintenanceRecords)
      .set(data)
      .where(and(eq(maintenanceRecords.id, id), eq(maintenanceRecords.organizationId, organizationId)))
      .returning();
    return record;
  }

  // Transaction operations
  async getTransactionsByOrganization(organizationId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.organizationId, organizationId)).orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Invoice operations
  async getInvoicesByOrganization(organizationId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.organizationId, organizationId)).orderBy(desc(invoices.date));
  }

  async getInvoicesByClient(clientId: string, organizationId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(and(eq(invoices.clientId, clientId), eq(invoices.organizationId, organizationId))).orderBy(desc(invoices.date));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, organizationId: string, data: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set(data)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)))
      .returning();
    return invoice;
  }

  // Organization settings operations
  async getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | undefined> {
    const [settings] = await db.select().from(organizationSettings).where(eq(organizationSettings.organizationId, organizationId));
    return settings;
  }

  async upsertOrganizationSettings(settings: InsertOrganizationSettings): Promise<OrganizationSettings> {
    const existing = await this.getOrganizationSettings(settings.organizationId);
    
    if (existing) {
      const [updated] = await db
        .update(organizationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(organizationSettings.organizationId, settings.organizationId))
        .returning();
      return updated;
    }

    const [newSettings] = await db.insert(organizationSettings).values(settings).returning();
    return newSettings;
  }

  // User management operations
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.organizationId, organizationId)).orderBy(users.nom);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserRole(userId: string, organizationId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any })
      .where(and(eq(users.id, userId), eq(users.organizationId, organizationId)))
      .returning();
    return user;
  }

  async deleteUser(userId: string, organizationId: string): Promise<void> {
    await db.delete(users).where(and(eq(users.id, userId), eq(users.organizationId, organizationId)));
  }
}

export const storage = new DatabaseStorage();
