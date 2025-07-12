import {
  users,
  skills,
  availability,
  swapRequests,
  ratings,
  adminMessages,
  reports,
  type User,
  type UpsertUser,
  type InsertUser,
  type Skill,
  type InsertSkill,
  type Availability,
  type InsertAvailability,
  type SwapRequest,
  type InsertSwapRequest,
  type Rating,
  type InsertRating,
  type AdminMessage,
  type InsertAdminMessage,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, ilike, sql } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations (mandatory for basic auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getUsersWithSkills(): Promise<any[]>;
  
  // Skill operations
  createSkill(skill: InsertSkill): Promise<Skill>;
  getSkillsByUserId(userId: string): Promise<Skill[]>;
  getSkillsByType(type: string): Promise<Skill[]>;
  searchSkills(query: string, category?: string): Promise<any[]>;
  updateSkill(id: number, updates: Partial<Skill>): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;
  
  // Availability operations
  upsertAvailability(availability: InsertAvailability): Promise<Availability>;
  getAvailabilityByUserId(userId: string): Promise<Availability[]>;
  
  // Swap request operations
  createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest>;
  getSwapRequestsByUserId(userId: string): Promise<any[]>;
  getSwapRequestById(id: number): Promise<any>;
  updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest>;
  deleteSwapRequest(id: number): Promise<void>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsByUserId(userId: string): Promise<Rating[]>;
  updateUserRating(userId: string): Promise<void>;
  
  // Admin operations
  createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage>;
  getActiveAdminMessages(): Promise<AdminMessage[]>;
  getAllUsers(): Promise<User[]>;
  banUser(userId: string): Promise<void>;
  unbanUser(userId: string): Promise<void>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<any[]>;
  updateReportStatus(id: number, status: string): Promise<Report>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id: crypto.randomUUID(),
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsersWithSkills(): Promise<any[]> {
    const result = await db
      .select({
        user: users,
        skill: skills,
      })
      .from(users)
      .leftJoin(skills, eq(users.id, skills.userId))
      .where(and(eq(users.isPublic, true), eq(users.isBanned, false)))
      .orderBy(desc(users.rating));
    
    // Group by user
    const userMap = new Map();
    result.forEach(row => {
      const userId = row.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...row.user,
          skills: [],
        });
      }
      if (row.skill) {
        userMap.get(userId).skills.push(row.skill);
      }
    });
    
    return Array.from(userMap.values());
  }

  // Skill operations
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async getSkillsByUserId(userId: string): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(and(eq(skills.userId, userId), eq(skills.isActive, true)))
      .orderBy(desc(skills.createdAt));
  }

  async getSkillsByType(type: string): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(and(eq(skills.type, type), eq(skills.isActive, true), eq(skills.isApproved, true)))
      .orderBy(desc(skills.createdAt));
  }

  async searchSkills(query: string, category?: string): Promise<any[]> {
    let conditions = [
      eq(skills.isActive, true),
      eq(skills.isApproved, true),
      or(
        ilike(skills.name, `%${query}%`),
        ilike(skills.description, `%${query}%`)
      )
    ];
    
    if (category) {
      conditions.push(eq(skills.category, category));
    }

    const result = await db
      .select({
        skill: skills,
        user: users,
      })
      .from(skills)
      .innerJoin(users, eq(skills.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(users.rating));

    return result;
  }

  async updateSkill(id: number, updates: Partial<Skill>): Promise<Skill> {
    const [skill] = await db
      .update(skills)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();
    return skill;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Availability operations
  async upsertAvailability(availabilityData: InsertAvailability): Promise<Availability> {
    const [existingAvailability] = await db
      .select()
      .from(availability)
      .where(and(
        eq(availability.userId, availabilityData.userId),
        eq(availability.dayOfWeek, availabilityData.dayOfWeek),
        eq(availability.timeSlot, availabilityData.timeSlot)
      ));

    if (existingAvailability) {
      const [updated] = await db
        .update(availability)
        .set(availabilityData)
        .where(eq(availability.id, existingAvailability.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(availability)
        .values(availabilityData)
        .returning();
      return created;
    }
  }

  async getAvailabilityByUserId(userId: string): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.userId, userId))
      .orderBy(availability.dayOfWeek, availability.timeSlot);
  }

  // Swap request operations
  async createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest> {
    const [newRequest] = await db.insert(swapRequests).values(request).returning();
    return newRequest;
  }

  async getSwapRequestsByUserId(userId: string): Promise<any[]> {
    const result = await db
      .select({
        request: swapRequests,
        requester: users,
        provider: users,
        offeredSkill: skills,
        requestedSkill: skills,
      })
      .from(swapRequests)
      .innerJoin(users, eq(swapRequests.requesterId, users.id))
      .innerJoin(skills, eq(swapRequests.offeredSkillId, skills.id))
      .where(or(
        eq(swapRequests.requesterId, userId),
        eq(swapRequests.providerId, userId)
      ))
      .orderBy(desc(swapRequests.createdAt));

    return result;
  }

  async getSwapRequestById(id: number): Promise<any> {
    const [result] = await db
      .select({
        request: swapRequests,
        requester: users,
        provider: users,
        offeredSkill: skills,
        requestedSkill: skills,
      })
      .from(swapRequests)
      .innerJoin(users, eq(swapRequests.requesterId, users.id))
      .innerJoin(skills, eq(swapRequests.offeredSkillId, skills.id))
      .where(eq(swapRequests.id, id));

    return result;
  }

  async updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest> {
    const [request] = await db
      .update(swapRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(swapRequests.id, id))
      .returning();
    return request;
  }

  async deleteSwapRequest(id: number): Promise<void> {
    await db.delete(swapRequests).where(eq(swapRequests.id, id));
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    // Update user's average rating
    await this.updateUserRating(rating.rateeId);
    return newRating;
  }

  async getRatingsByUserId(userId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.rateeId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async updateUserRating(userId: string): Promise<void> {
    const [result] = await db
      .select({
        avgRating: sql`AVG(${ratings.rating})`.as('avgRating'),
        totalRatings: sql`COUNT(*)`.as('totalRatings'),
      })
      .from(ratings)
      .where(eq(ratings.rateeId, userId));

    if (result && result.totalRatings && Number(result.totalRatings) > 0) {
      await db
        .update(users)
        .set({
          rating: Number(result.avgRating),
          totalRatings: Number(result.totalRatings),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  // Admin operations
  async createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage> {
    const [newMessage] = await db.insert(adminMessages).values(message).returning();
    return newMessage;
  }

  async getActiveAdminMessages(): Promise<AdminMessage[]> {
    return await db
      .select()
      .from(adminMessages)
      .where(eq(adminMessages.isActive, true))
      .orderBy(desc(adminMessages.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async banUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isBanned: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async unbanUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isBanned: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReports(): Promise<any[]> {
    const result = await db
      .select({
        report: reports,
        reporter: users,
        reportedUser: users,
        reportedSkill: skills,
        reportedRequest: swapRequests,
      })
      .from(reports)
      .innerJoin(users, eq(reports.reporterId, users.id))
      .leftJoin(skills, eq(reports.reportedSkillId, skills.id))
      .leftJoin(swapRequests, eq(reports.reportedRequestId, swapRequests.id))
      .orderBy(desc(reports.createdAt));

    return result;
  }

  async updateReportStatus(id: number, status: string): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }
}

export const storage = new DatabaseStorage();
