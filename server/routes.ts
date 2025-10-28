import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertVehicleSchema,
  insertUserSchema,
  insertDriverSchema,
  insertClientSchema,
  insertFuelRecordSchema,
  insertMaintenanceRecordSchema,
  insertTransactionSchema,
  insertInvoiceSchema
} from "@shared/schema";

// Super Admin middleware
const isSuperAdmin = async (req: any, res: any, next: any) => {
  try {
    const replitAuthId = req.user.claims.sub;
    const user = await storage.getUserByReplitAuthId(replitAuthId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized: Super admin access required" });
    }
    
    req.currentUser = user;
    next();
  } catch (error) {
    console.error("Error in super admin middleware:", error);
    res.status(500).json({ message: "Authorization failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const vehicles = await storage.getVehiclesByOrganization(user.organizationId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validatedData = insertVehicleSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const vehicle = await storage.createVehicle(validatedData);
      res.json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({ message: "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const vehicle = await storage.updateVehicle(req.params.id, user.organizationId, req.body);
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(400).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      await storage.deleteVehicle(req.params.id, user.organizationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(400).json({ message: "Failed to delete vehicle" });
    }
  });

  // Driver routes
  app.get("/api/drivers", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const drivers = await storage.getDriversByOrganization(user.organizationId);
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post("/api/drivers", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validatedData = insertDriverSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const driver = await storage.createDriver(validatedData);
      res.json(driver);
    } catch (error) {
      console.error("Error creating driver:", error);
      res.status(400).json({ message: "Failed to create driver" });
    }
  });

  app.patch("/api/drivers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const driver = await storage.updateDriver(req.params.id, user.organizationId, req.body);
      res.json(driver);
    } catch (error) {
      console.error("Error updating driver:", error);
      res.status(400).json({ message: "Failed to update driver" });
    }
  });

  app.delete("/api/drivers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      await storage.deleteDriver(req.params.id, user.organizationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting driver:", error);
      res.status(400).json({ message: "Failed to delete driver" });
    }
  });

  // Client routes
  app.get("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const clients = await storage.getClientsByOrganization(user.organizationId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validatedData = insertClientSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const client = await storage.createClient(validatedData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validatedData = insertClientSchema.partial().omit({ organizationId: true }).parse(req.body);
      const client = await storage.updateClient(req.params.id, user.organizationId, validatedData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      await storage.deleteClient(req.params.id, user.organizationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(400).json({ message: "Failed to delete client" });
    }
  });

  // Fuel routes
  app.get("/api/fuel", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const records = await storage.getFuelRecordsByOrganization(user.organizationId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching fuel records:", error);
      res.status(500).json({ message: "Failed to fetch fuel records" });
    }
  });

  app.post("/api/fuel", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const payload = {
        ...req.body,
        organizationId: user.organizationId,
      };
      
      // Convert ISO string to Date object if present
      if (payload.date) {
        payload.date = new Date(payload.date);
      }

      const validatedData = insertFuelRecordSchema.parse(payload);

      const record = await storage.createFuelRecord(validatedData);
      res.json(record);
    } catch (error) {
      console.error("Error creating fuel record:", error);
      res.status(400).json({ message: "Failed to create fuel record" });
    }
  });

  // Maintenance routes
  app.get("/api/maintenance", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const records = await storage.getMaintenanceRecordsByOrganization(user.organizationId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      res.status(500).json({ message: "Failed to fetch maintenance records" });
    }
  });

  app.get("/api/maintenance/upcoming", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const records = await storage.getUpcomingMaintenance(user.organizationId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching upcoming maintenance:", error);
      res.status(500).json({ message: "Failed to fetch upcoming maintenance" });
    }
  });

  app.post("/api/maintenance", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validatedData = insertMaintenanceRecordSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const record = await storage.createMaintenanceRecord(validatedData);
      res.json(record);
    } catch (error) {
      console.error("Error creating maintenance record:", error);
      res.status(400).json({ message: "Failed to create maintenance record" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const transactions = await storage.getTransactionsByOrganization(user.organizationId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const invoices = await storage.getInvoicesByOrganization(user.organizationId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validatedData = insertInvoiceSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const invoice = await storage.createInvoice(validatedData);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  // Organization settings routes
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const settings = await storage.getOrganizationSettings(user.organizationId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const settings = await storage.upsertOrganizationSettings({
        ...req.body,
        organizationId: user.organizationId,
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // User management routes
  app.post("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Only admin_entreprise and super_admin can create users
      if (user.role !== "admin_entreprise" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Unauthorized: Only administrators can create users" });
      }

      // Validate request body with schema
      const createUserSchema = insertUserSchema.omit({ organizationId: true, replitAuthId: true });
      const validatedData = createUserSchema.parse(req.body);

      const newUser = await storage.createUser({
        ...validatedData,
        organizationId: user.organizationId,
        replitAuthId: null,
      });
      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const users = await storage.getUsersByOrganization(user.organizationId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Only allow role updates for now
      const updatedUser = await storage.updateUserRole(req.params.id, user.organizationId, req.body.role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });

      await storage.deleteUser(req.params.id, user.organizationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const [vehicles, drivers, maintenance, transactions] = await Promise.all([
        storage.getVehiclesByOrganization(user.organizationId),
        storage.getDriversByOrganization(user.organizationId),
        storage.getUpcomingMaintenance(user.organizationId),
        storage.getTransactionsByOrganization(user.organizationId),
      ]);

      // Calculate stats
      const activeVehicles = vehicles.filter(v => v.status === 'disponible' || v.status === 'en_location').length;
      const activeDrivers = drivers.filter(d => d.status === 'actif').length;
      const upcomingMaintenance = maintenance.length;
      
      // Calculate monthly revenue
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = transactions
        .filter(t => t.type === 'recette' && new Date(t.date) >= monthStart)
        .reduce((sum, t) => sum + parseFloat(t.montant.toString()), 0);

      res.json({
        activeVehicles,
        totalVehicles: vehicles.length,
        activeDrivers,
        upcomingMaintenance,
        monthlyRevenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin routes - Organization management (super_admin only)
  app.get("/api/admin/organizations", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.patch("/api/admin/organizations/:id", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const updateData = { ...req.body };
      
      // Convert date strings to Date objects if present
      if (updateData.dateDebutAbonnement && typeof updateData.dateDebutAbonnement === 'string') {
        updateData.dateDebutAbonnement = new Date(updateData.dateDebutAbonnement);
      }
      if (updateData.dateFinAbonnement && typeof updateData.dateFinAbonnement === 'string') {
        updateData.dateFinAbonnement = new Date(updateData.dateFinAbonnement);
      }
      
      const organization = await storage.updateOrganization(req.params.id, updateData);
      res.json(organization);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(400).json({ message: "Failed to update organization" });
    }
  });

  app.get("/api/admin/organizations/:id/stats", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const [vehicles, users] = await Promise.all([
        storage.getVehiclesByOrganization(req.params.id),
        storage.getUsersByOrganization(req.params.id),
      ]);

      res.json({
        totalVehicles: vehicles.length,
        totalUsers: users.length,
      });
    } catch (error) {
      console.error("Error fetching organization stats:", error);
      res.status(500).json({ message: "Failed to fetch organization stats" });
    }
  });

  // Get organization settings (for feature flags)
  app.get("/api/admin/organizations/:id/settings", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      let settings = await storage.getOrganizationSettings(req.params.id);
      
      // Si aucun settings n'existe, créer les defaults et les persister
      if (!settings) {
        const defaultFeatures = ['vehicles', 'drivers', 'clients', 'fuel', 'maintenance', 'treasury', 'invoices'];
        settings = await storage.upsertOrganizationSettings({
          organizationId: req.params.id,
          enabledFeatures: defaultFeatures,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching organization settings:", error);
      res.status(500).json({ message: "Failed to fetch organization settings" });
    }
  });

  // Update organization settings (for feature flags)
  app.patch("/api/admin/organizations/:id/settings", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const { enabledFeatures } = req.body;
      
      // Validate enabledFeatures
      const ALLOWED_FEATURES = ['vehicles', 'drivers', 'clients', 'fuel', 'maintenance', 'treasury', 'invoices'];
      if (!Array.isArray(enabledFeatures)) {
        return res.status(400).json({ message: "enabledFeatures doit être un tableau" });
      }
      
      const invalidFeatures = enabledFeatures.filter(f => !ALLOWED_FEATURES.includes(f));
      if (invalidFeatures.length > 0) {
        return res.status(400).json({ message: `Fonctionnalités invalides: ${invalidFeatures.join(', ')}` });
      }
      
      const settings = await storage.upsertOrganizationSettings({
        organizationId: req.params.id,
        enabledFeatures,
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating organization settings:", error);
      res.status(500).json({ message: "Failed to update organization settings" });
    }
  });

  // Rate limiting for promotion attempts (IP-based to prevent email rotation bypass)
  const promotionAttempts = new Map<string, { count: number; firstAttempt: number }>();
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Promote user to super_admin (secured with ADMIN_SETUP_CODE + IP-based rate limiting)
  app.post("/api/admin/promote", async (req: any, res) => {
    try {
      const { email, securityCode } = req.body;
      
      if (!email || !securityCode) {
        return res.status(400).json({ message: "Email et code de sécurité requis" });
      }

      // IP-based rate limiting (prevents bypass by rotating emails)
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      
      const attempts = promotionAttempts.get(clientIp);
      if (attempts) {
        // Check if lockout period has expired
        if (now - attempts.firstAttempt > LOCKOUT_DURATION) {
          promotionAttempts.delete(clientIp);
        } else if (attempts.count >= MAX_ATTEMPTS) {
          const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempts.firstAttempt)) / 60000);
          console.warn(`Promotion locked for IP ${clientIp} - too many attempts`);
          return res.status(429).json({ 
            message: `Trop de tentatives. Réessayez dans ${remainingTime} minute(s).` 
          });
        }
      }

      // Verify security code FIRST (before any database operations)
      const adminSetupCode = process.env.ADMIN_SETUP_CODE;
      if (!adminSetupCode) {
        console.error("ADMIN_SETUP_CODE not configured");
        return res.status(500).json({ message: "Configuration serveur manquante" });
      }

      if (securityCode !== adminSetupCode) {
        // Track failed attempt
        if (attempts) {
          attempts.count++;
        } else {
          promotionAttempts.set(clientIp, { count: 1, firstAttempt: now });
        }
        
        const attemptCount = (attempts?.count || 0) + 1;
        console.warn(`Failed promotion attempt ${attemptCount}/${MAX_ATTEMPTS} for ${email} from ${clientIp} - invalid code`);
        
        // Return same error for both invalid code and non-existent user to prevent information leakage
        return res.status(403).json({ message: "Email ou code de sécurité incorrect" });
      }

      // ONLY promote if code is correct
      const user = await storage.promoteUserToSuperAdmin(email);
      
      if (!user) {
        // User doesn't exist - use same error message to prevent info leak
        console.warn(`Promotion failed for ${email} from ${clientIp} - user not found`);
        return res.status(403).json({ message: "Email ou code de sécurité incorrect" });
      }

      // Clear attempts on success
      promotionAttempts.delete(clientIp);

      console.log(`User ${email} promoted to super_admin successfully from ${clientIp}`);
      res.json({ 
        message: "Utilisateur promu en super_admin avec succès",
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Erreur lors de la promotion de l'utilisateur" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
