import { Router } from 'express';
import { storage } from '../storage';
import { insertWorkshopCommentSchema } from '@shared/schema';

const router = Router();

// GET /api/workshop-comments/:postId - Get all comments for a workshop post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await storage.listWorkshopComments(postId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching workshop comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/workshop-comments - Create a new comment
router.post('/', async (req, res) => {
  try {
    const { postId, content } = req.body;
    
    // Validate input
    const validatedData = insertWorkshopCommentSchema.parse({ postId, content });
    
    // Mock user ID - in real app, get from authentication
    const userId = 'mock-user-id';
    
    const newComment = await storage.createWorkshopComment({
      postId: validatedData.postId,
      userId,
      content: validatedData.content,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating workshop comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

export default router;
