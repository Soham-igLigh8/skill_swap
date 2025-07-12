import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  bio: text("bio"),
  isPublic: boolean("is_public").default(true),
  isAdmin: boolean("is_admin").default(false),
  isBanned: boolean("is_banned").default(false),
  rating: real("rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  level: varchar("level").notNull(), // beginner, intermediate, advanced, expert
  type: varchar("type").notNull(), // offered, wanted
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dayOfWeek: varchar("day_of_week").notNull(), // monday, tuesday, etc.
  timeSlot: varchar("time_slot").notNull(), // morning, afternoon, evening
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const swapRequests = pgTable("swap_requests", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  offeredSkillId: integer("offered_skill_id").notNull().references(() => skills.id),
  requestedSkillId: integer("requested_skill_id").notNull().references(() => skills.id),
  message: text("message"),
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, completed, cancelled
  preferredTimes: text("preferred_times").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  raterId: varchar("rater_id").notNull().references(() => users.id),
  rateeId: varchar("ratee_id").notNull().references(() => users.id),
  swapRequestId: integer("swap_request_id").notNull().references(() => swapRequests.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminMessages = pgTable("admin_messages", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // announcement, maintenance, feature_update
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").references(() => users.id),
  reportedSkillId: integer("reported_skill_id").references(() => skills.id),
  reportedRequestId: integer("reported_request_id").references(() => swapRequests.id),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("pending"), // pending, reviewed, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  skills: many(skills),
  availability: many(availability),
  sentRequests: many(swapRequests, { relationName: "requester" }),
  receivedRequests: many(swapRequests, { relationName: "provider" }),
  givenRatings: many(ratings, { relationName: "rater" }),
  receivedRatings: many(ratings, { relationName: "ratee" }),
  adminMessages: many(adminMessages),
  reports: many(reports),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  user: one(users, { fields: [skills.userId], references: [users.id] }),
  offeredRequests: many(swapRequests, { relationName: "offeredSkill" }),
  requestedRequests: many(swapRequests, { relationName: "requestedSkill" }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  user: one(users, { fields: [availability.userId], references: [users.id] }),
}));

export const swapRequestsRelations = relations(swapRequests, ({ one, many }) => ({
  requester: one(users, { fields: [swapRequests.requesterId], references: [users.id], relationName: "requester" }),
  provider: one(users, { fields: [swapRequests.providerId], references: [users.id], relationName: "provider" }),
  offeredSkill: one(skills, { fields: [swapRequests.offeredSkillId], references: [skills.id], relationName: "offeredSkill" }),
  requestedSkill: one(skills, { fields: [swapRequests.requestedSkillId], references: [skills.id], relationName: "requestedSkill" }),
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  rater: one(users, { fields: [ratings.raterId], references: [users.id], relationName: "rater" }),
  ratee: one(users, { fields: [ratings.rateeId], references: [users.id], relationName: "ratee" }),
  swapRequest: one(swapRequests, { fields: [ratings.swapRequestId], references: [swapRequests.id] }),
}));

export const adminMessagesRelations = relations(adminMessages, ({ one }) => ({
  admin: one(users, { fields: [adminMessages.adminId], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporterId], references: [users.id] }),
  reportedUser: one(users, { fields: [reports.reportedUserId], references: [users.id] }),
  reportedSkill: one(skills, { fields: [reports.reportedSkillId], references: [skills.id] }),
  reportedRequest: one(swapRequests, { fields: [reports.reportedRequestId], references: [swapRequests.id] }),
}));

// Insert schemas
export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
  createdAt: true,
});

export const insertSwapRequestSchema = createInsertSchema(swapRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;
export type InsertSwapRequest = z.infer<typeof insertSwapRequestSchema>;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;
export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
