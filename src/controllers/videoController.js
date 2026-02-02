import path from 'path';
import config from '../config/config.js';
import {
  compressVideo,
  getVideoInfo,
  getFileSize,
  calculateCompressionRatio,
  cleanupFile,
  generateFilename,
} from '../utils/ffmpeg.js';

/**
 * Compress a video file
 */
export const compress = async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded',
      });
    }

    inputPath = req.file.path;

    // Get compression options from request body
    const {
      quality = 'medium',
      codec = 'h264',
      crf,
      preset,
      audioBitrate,
      resolution,
      keepOriginal = false,
    } = req.body;

    // Validate quality preset
    const validQualities = Object.keys(config.compression.presets);
    if (quality && !validQualities.includes(quality)) {
      await cleanupFile(inputPath);
      return res.status(400).json({
        success: false,
        error: `Invalid quality preset. Valid options: ${validQualities.join(', ')}`,
      });
    }

    // Get original video info
    const originalInfo = await getVideoInfo(inputPath);
    const originalSize = await getFileSize(inputPath);

    // Generate output filename
    const outputFilename = generateFilename(req.file.originalname);
    outputPath = path.join(config.upload.compressedDir, outputFilename);

    // Compress the video
    console.log('Starting compression...');
    const compressionResult = await compressVideo(inputPath, outputPath, {
      quality,
      codec,
      crf: crf ? parseInt(crf) : undefined,
      preset,
      audioBitrate,
      resolution,
    });

    // Get compressed video info
    const compressedSize = await getFileSize(outputPath);
    const compressionRatio = calculateCompressionRatio(originalSize, compressedSize);

    // Clean up original file if requested
    if (!keepOriginal) {
      await cleanupFile(inputPath);
    }

    // Send response
    res.json({
      success: true,
      message: 'Video compressed successfully',
      data: {
        originalFile: {
          name: req.file.originalname,
          size: originalSize,
          sizeFormatted: formatFileSize(originalSize),
          duration: originalInfo.format.duration,
        },
        compressedFile: {
          name: outputFilename,
          size: compressedSize,
          sizeFormatted: formatFileSize(compressedSize),
          downloadUrl: `/download/${outputFilename}`,
        },
        compression: {
          ratio: `${compressionRatio}%`,
          savedBytes: originalSize - compressedSize,
          savedFormatted: formatFileSize(originalSize - compressedSize),
        },
        settings: {
          quality,
          codec,
          crf: crf || config.compression.presets[quality].crf,
          preset: preset || config.compression.presets[quality].preset,
        },
      },
    });

  } catch (error) {
    console.error('Compression error:', error);

    // Clean up files on error
    if (inputPath) await cleanupFile(inputPath);
    if (outputPath) await cleanupFile(outputPath);

    res.status(500).json({
      success: false,
      error: 'Failed to compress video',
      details: error.message || error.error,
    });
  }
};

/**
 * Get video information
 */
export const getInfo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded',
      });
    }

    const metadata = await getVideoInfo(req.file.path);
    
    // Clean up the uploaded file
    await cleanupFile(req.file.path);

    res.json({
      success: true,
      data: {
        format: metadata.format,
        streams: metadata.streams,
      },
    });

  } catch (error) {
    if (req.file?.path) {
      await cleanupFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get video information',
      details: error.message,
    });
  }
};

/**
 * Get available compression presets
 */
export const getPresets = (req, res) => {
  res.json({
    success: true,
    data: {
      presets: config.compression.presets,
      codecs: Object.keys(config.compression.codecs),
    },
  });
};

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default {
  compress,
  getInfo,
  getPresets,
};
