import express from 'express';
import { upload, handleMulterError } from '../middleware/upload.js';
import { compress, getInfo, getPresets } from '../controllers/videoController.js';

const router = express.Router();

/**
 * POST /api/compress
 * Compress a video file
 * 
 * Body params:
 * - file: video file (multipart/form-data)
 * - quality: 'high' | 'medium' | 'low' | 'youtube' | 'tiktok' (optional, default: 'medium')
 * - codec: 'h264' | 'h265' | 'vp9' (optional, default: 'h264')
 * - crf: number between 0-51 (optional, overrides quality preset)
 * - preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow' (optional)
 * - audioBitrate: string like '128k', '192k' (optional, default: '128k')
 * - resolution: string like '1280x720', '1920x1080' (optional)
 * - keepOriginal: boolean (optional, default: false)
 */
router.post('/compress', upload.single('video'), handleMulterError, compress);

/**
 * POST /api/info
 * Get video metadata/information
 * 
 * Body params:
 * - file: video file (multipart/form-data)
 */
router.post('/info', upload.single('video'), handleMulterError, getInfo);

/**
 * GET /api/presets
 * Get available compression presets and codecs
 */
router.get('/presets', getPresets);

export default router;
