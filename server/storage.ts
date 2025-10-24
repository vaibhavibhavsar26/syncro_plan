import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

type WaitlistEntry = {
  fullName: string;
  email: string;
  userType: string;
  updates: boolean;
  createdAt: Date;
};

type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
};

type Task = {
  id: string;
  userId: number;
  name: string;
  date: string;
  time: string;
  duration: string;
  reminder: boolean;
  status: "pending" | "ongoing" | "completed";
  createdAt: Date;
};

// Define a timetable entry type
type TimetableEntry = {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: number; // userId of faculty who created it
  timetableData: any[]; // The timetable JSON data
};

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { fullName?: string, userType?: string }): Promise<User>;
  addToWaitlist(entry: WaitlistEntry): Promise<void>;
  saveContactMessage(message: ContactMessage): Promise<void>;
  getTasksByUserId(userId: number | undefined): Task[];
  getTaskById(id: string): Task | undefined;
  createTask(task: Task): Task;
  updateTask(task: Task): Task;
  deleteTask(id: string): void;
  // Timetable storage methods
  saveTimetable(name: string, data: any[], userId: number): Promise<TimetableEntry>;
  getAllTimetables(): Promise<TimetableEntry[]>;
  getTimetableById(id: string): Promise<TimetableEntry | undefined>;
  getTimetablesByFaculty(facultyId: number): Promise<TimetableEntry[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlist: WaitlistEntry[];
  private contactMessages: ContactMessage[];
  private tasks: Map<string, Task>;
  private timetables: Map<string, TimetableEntry>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.waitlist = [];
    this.contactMessages = [];
    this.tasks = new Map();
    this.timetables = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Create a default admin user with plaintext format password
    // The format "PLAINTEXT:" is a special flag for our auth system
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "PLAINTEXT:admin123",
      fullName: "Administrator",
      userType: "faculty"
    });
    this.currentId = 2; // Start new users from ID 2
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser & { fullName?: string, userType?: string }): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      fullName: insertUser.fullName || "",
      userType: insertUser.userType || "student"
    };
    this.users.set(id, user);
    return user;
  }

  async addToWaitlist(entry: WaitlistEntry): Promise<void> {
    this.waitlist.push(entry);
  }

  async saveContactMessage(message: ContactMessage): Promise<void> {
    this.contactMessages.push(message);
    console.log('[Contact Message Received]', {
      from: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
      timestamp: message.createdAt
    });
  }

  getTasksByUserId(userId: number | undefined): Task[] {
    if (!userId) return [];
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  createTask(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  updateTask(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  deleteTask(id: string): void {
    this.tasks.delete(id);
  }

  // Timetable methods
  async saveTimetable(name: string, data: any[], userId: number): Promise<TimetableEntry> {
    const id = `timetable_${Date.now()}`;
    const timetableEntry: TimetableEntry = {
      id,
      name,
      createdAt: new Date(),
      createdBy: userId,
      timetableData: data
    };
    
    this.timetables.set(id, timetableEntry);
    console.log(`Timetable saved: ${name} by user ${userId}`);
    return timetableEntry;
  }

  async getAllTimetables(): Promise<TimetableEntry[]> {
    return Array.from(this.timetables.values());
  }

  async getTimetableById(id: string): Promise<TimetableEntry | undefined> {
    return this.timetables.get(id);
  }

  async getTimetablesByFaculty(facultyId: number): Promise<TimetableEntry[]> {
    return Array.from(this.timetables.values())
      .filter(timetable => timetable.createdBy === facultyId);
  }
}

export const storage = new MemStorage();
