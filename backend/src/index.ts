import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import uploadRoutes from './routes/uploadRoutes';
import userRoutes from './routes/userRoutes';
import path from 'path';
import { healthCheck } from './controllers/userController';
import { supabase } from './config/supabase';
import blogRoutes from './routes/blogRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (for development only)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', chatRoutes);
app.use('/api', uploadRoutes);
app.use('/api', userRoutes);
app.use('/api', blogRoutes);

// Create a router for document routes
const documentRouter = express.Router();

const publishDocument: express.RequestHandler = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          content,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('Error publishing document:', error);
      res.status(500).json({ error: 'Failed to publish document' });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Document published successfully',
      document: data[0]
    });
  } catch (error) {
    console.error('Error in publish-document endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

documentRouter.post('/publish-document', publishDocument);

// Use the router
app.use('/api', documentRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Something went wrong!',
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});