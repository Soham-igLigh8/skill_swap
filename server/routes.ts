import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSkillSchema, 
  insertSwapRequestSchema, 
  insertRatingSchema, 
  insertAdminMessageSchema,
  insertReportSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Middleware to check authentication
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes are handled in auth.ts

  // User routes
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/with-skills', async (req, res) => {
    try {
      const users = await storage.getUsersWithSkills();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users with skills:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Skill routes
  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skillData = { ...req.body, userId };
      const validatedSkill = insertSkillSchema.parse(skillData);
      const skill = await storage.createSkill(validatedSkill);
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.get('/api/skills/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const skills = await storage.getSkillsByUserId(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/skills/type/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const skills = await storage.getSkillsByType(type);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills by type:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/skills/search', async (req, res) => {
    try {
      const { q, category } = req.query;
      const skills = await storage.searchSkills(q as string, category as string);
      res.json(skills);
    } catch (error) {
      console.error("Error searching skills:", error);
      res.status(500).json({ message: "Failed to search skills" });
    }
  });

  app.put('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const skill = await storage.updateSkill(parseInt(id), updates);
      res.json(skill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSkill(parseInt(id));
      res.json({ message: "Skill deleted successfully" });
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Availability routes
  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const availabilityData = { ...req.body, userId };
      const availability = await storage.upsertAvailability(availabilityData);
      res.json(availability);
    } catch (error) {
      console.error("Error updating availability:", error);
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  app.get('/api/availability/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const availability = await storage.getAvailabilityByUserId(userId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Swap request routes
  app.post('/api/swap-requests', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.id;
      const requestData = { ...req.body, requesterId };
      const validatedRequest = insertSwapRequestSchema.parse(requestData);
      const request = await storage.createSwapRequest(validatedRequest);
      res.json(request);
    } catch (error) {
      console.error("Error creating swap request:", error);
      res.status(500).json({ message: "Failed to create swap request" });
    }
  });

  app.get('/api/swap-requests/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const requests = await storage.getSwapRequestsByUserId(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.get('/api/swap-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getSwapRequestById(parseInt(id));
      res.json(request);
    } catch (error) {
      console.error("Error fetching swap request:", error);
      res.status(500).json({ message: "Failed to fetch swap request" });
    }
  });

  app.put('/api/swap-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const request = await storage.updateSwapRequestStatus(parseInt(id), status);
      res.json(request);
    } catch (error) {
      console.error("Error updating swap request status:", error);
      res.status(500).json({ message: "Failed to update swap request status" });
    }
  });

  app.delete('/api/swap-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSwapRequest(parseInt(id));
      res.json({ message: "Swap request deleted successfully" });
    } catch (error) {
      console.error("Error deleting swap request:", error);
      res.status(500).json({ message: "Failed to delete swap request" });
    }
  });

  // Rating routes
  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const raterId = req.user.id;
      const ratingData = { ...req.body, raterId };
      const validatedRating = insertRatingSchema.parse(ratingData);
      const rating = await storage.createRating(validatedRating);
      res.json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  app.get('/api/ratings/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const ratings = await storage.getRatingsByUserId(userId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // Admin routes
  app.post('/api/admin/messages', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const messageData = { ...req.body, adminId };
      const validatedMessage = insertAdminMessageSchema.parse(messageData);
      const message = await storage.createAdminMessage(validatedMessage);
      res.json(message);
    } catch (error) {
      console.error("Error creating admin message:", error);
      res.status(500).json({ message: "Failed to create admin message" });
    }
  });

  app.get('/api/admin/messages', async (req, res) => {
    try {
      const messages = await storage.getActiveAdminMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
      res.status(500).json({ message: "Failed to fetch admin messages" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/ban/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      await storage.banUser(userId);
      res.json({ message: "User banned successfully" });
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.post('/api/admin/unban/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      await storage.unbanUser(userId);
      res.json({ message: "User unbanned successfully" });
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ message: "Failed to unban user" });
    }
  });

  // Report routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const reporterId = req.user.id;
      const reportData = { ...req.body, reporterId };
      const validatedReport = insertReportSchema.parse(reportData);
      const report = await storage.createReport(validatedReport);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.put('/api/reports/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const report = await storage.updateReportStatus(parseInt(id), status);
      res.json(report);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ message: "Failed to update report status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
