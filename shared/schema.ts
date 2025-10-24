import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  userType: text("user_type").default("student"),  // "student" or "faculty"
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  userType: text("user_type").notNull(),
  updates: boolean("updates").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: text("duration").notNull(),
  reminder: boolean("reminder").default(false),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Schema for inserting waitlist entries
export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true
});

// Schema for inserting contact messages
export const insertContactSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true
});

// Schema for inserting tasks
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});

// Types for use in the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
