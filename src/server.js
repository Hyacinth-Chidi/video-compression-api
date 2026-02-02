import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import videoRoutes from './routes/videoRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', videoRoutes);

// Serve compressed videos for download - REMOVED to allow custom route to handle headers
// app.use('/download', express.static(config.upload.compressedDir));

// Better download endpoint with proper headers
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(config.upload.compressedDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
  
  // Set proper headers for download
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  
  // Stream the file
  const fileStream = fs.createReadStream(filepath);
  fileStream.pipe(res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Video compression API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Video Compression API',
    version: '1.0.0',
    endpoints: {
      compress: 'POST /api/compress',
      info: 'POST /api/info',
      presets: 'GET /api/presets',
      health: 'GET /health',
    },
    documentation: {
      compress: {
        method: 'POST',
        endpoint: '/api/compress',
        description: 'Compress a video file',
        contentType: 'multipart/form-data',
        parameters: {
          video: 'Video file (required)',
          quality: 'Compression quality: high, medium, low, youtube, tiktok (optional, default: medium)',
          codec: 'Video codec: h264, h265, vp9 (optional, default: h264)',
          crf: 'Constant Rate Factor 0-51, lower is better quality (optional)',
          preset: 'Encoding speed preset (optional)',
          audioBitrate: 'Audio bitrate like 128k, 192k (optional, default: 128k)',
          resolution: 'Output resolution like 1280x720 (optional)',
          keepOriginal: 'Keep original file (optional, default: false)',
        },
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: config.env === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║   Video Compression API                            ║
║   Server running on port ${config.port}                    ║
║   Environment: ${config.env}                      ║
║   API URL: http://localhost:${config.port}                ║
╚════════════════════════════════════════════════════╝
  `);
});

export default app;
