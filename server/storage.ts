import { type User, type InsertUser, type InsertThread, type Thread, type InsertComment, type Comment, type WorkshopComment, type InsertWorkshopComment } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Threads
  createThread(thread: InsertThread & { userId: string }): Promise<Thread>;
  getThread(id: string): Promise<Thread | undefined>;
  listThreads(): Promise<Thread[]>;

  // Comments
  createComment(comment: InsertComment & { userId: string }): Promise<Comment>;
  listComments(threadId: string): Promise<Comment[]>;

  // Workshop Comments
  createWorkshopComment(comment: InsertWorkshopComment & { userId: string }): Promise<WorkshopComment>;
  listWorkshopComments(postId: string): Promise<WorkshopComment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private threads: Map<string, Thread> = new Map();
  private comments: Map<string, Comment> = new Map();
  private workshopComments: Map<string, WorkshopComment> = new Map();

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: 'member',
      badges: [],
      avatar: insertUser.avatar ?? null,
      bio: insertUser.bio ?? null,
      createdAt: new Date(),
    } as User;
    this.users.set(id, user);
    return user;
  }

  /* -------------------- Threads -------------------- */
  async createThread(insertThread: InsertThread & { userId: string }): Promise<Thread> {
    const id = randomUUID();
    const thread: Thread = {
      ...insertThread,
      id,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Thread;
    this.threads.set(id, thread);
    return thread;
  }

  async getThread(id: string): Promise<Thread | undefined> {
    return this.threads.get(id);
  }

  async listThreads(): Promise<Thread[]> {
    return Array.from(this.threads.values());
  }

  /* -------------------- Comments -------------------- */
  async createComment(insertComment: InsertComment & { userId: string }): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      likes: 0,
      createdAt: new Date(),
    } as Comment;
    this.comments.set(id, comment);

    // bump thread comment count
    const thread = this.threads.get(comment.threadId);
    if (thread) {
      thread.comments = (thread.comments ?? 0) + 1;
      thread.updatedAt = new Date();
      this.threads.set(thread.id, thread);
    }
    return comment;
  }

  async listComments(threadId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.threadId === threadId);
  }

  async createWorkshopComment(comment: InsertWorkshopComment & { userId: string }): Promise<WorkshopComment> {
    const id = randomUUID();
    const workshopComment = {
      ...comment,
      id,
      likes: 0,
      createdAt: new Date(),
    } as WorkshopComment;
    this.workshopComments.set(id, workshopComment);
    return workshopComment;
  }

  async listWorkshopComments(postId: string): Promise<WorkshopComment[]> {
    return Array.from(this.workshopComments.values()).filter(c => c.postId === postId);
  }
}

export const storage = new MemStorage();
