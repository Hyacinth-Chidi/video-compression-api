import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024, // 500MB
    uploadDir: process.env.UPLOAD_DIR || join(__dirname, '../../uploads'),
    compressedDir: process.env.COMPRESSED_DIR || join(__dirname, '../../compressed'),
  },
  
  ffmpeg: {
    path: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
    probePath: process.env.FFPROBE_PATH || '/usr/bin/ffprobe',
    defaultCrf: parseInt(process.env.DEFAULT_CRF) || 23,
    defaultPreset: process.env.DEFAULT_PRESET || 'medium',
  },
  
  compression: {
    presets: {
      high: { crf: 18, preset: 'slow', description: 'Highest quality, larger file' },
      medium: { crf: 23, preset: 'medium', description: 'Balanced quality and size' },
      low: { crf: 28, preset: 'fast', description: 'Lower quality, smallest file' },
      youtube: { crf: 21, preset: 'medium', description: 'YouTube recommended' },
      tiktok: { crf: 23, preset: 'fast', description: 'TikTok optimized' },
    },
    
    codecs: {
      h264: 'libx264',
      h265: 'libx265',
      vp9: 'libvpx-vp9',
    },
  },
};

export default config;
