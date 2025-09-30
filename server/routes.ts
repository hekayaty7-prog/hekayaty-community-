import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import workshopCommentsRouter from "./routes/workshopComments";

export async function registerRoutes(app: Express): Promise<Server> {
  // Threads routes
  app.post('/api/threads', async (req, res, next) => {
    try {
      const { title, content, category, tags } = req.body;
      const userId = req.body.userId || 'anonymous';
      const thread = await storage.createThread({ title, content, category, tags, userId });
      res.status(201).json(thread);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/threads', async (_req, res, next) => {
    try {
      const threads = await storage.listThreads();
      res.json(threads);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/threads/:id', async (req, res, next) => {
    try {
      const thread = await storage.getThread(req.params.id);
      if (!thread) return res.status(404).json({ message: 'Not found' });
      res.json(thread);
    } catch (err) {
      next(err);
    }
  });

  // Comments
  app.post('/api/threads/:id/comments', async (req, res, next) => {
    try {
      const { content, parentId } = req.body;
      const userId = req.body.userId || 'anonymous';
      const comment = await storage.createComment({ threadId: req.params.id, content, parentId, userId });
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/threads/:id/comments', async (req, res, next) => {
    try {
      const comments = await storage.listComments(req.params.id);
      res.json(comments);
    } catch (err) {
      next(err);
    }
  });

  // Workshop Comments routes
  app.use('/api/workshop-comments', workshopCommentsRouter);

  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
