import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { unlink } from 'fs/promises';
import path from 'path';
import config from '../config/config.js';

// Set FFmpeg paths
ffmpeg.setFfmpegPath(config.ffmpeg.path);
ffmpeg.setFfprobePath(config.ffmpeg.probePath);

/**
 * Get video metadata
 */
export const getVideoInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata);
    });
  });
};

/**
 * Compress video with specified options
 */
export const compressVideo = async (inputPath, outputPath, options = {}) => {
  const {
    codec = 'h264',
    quality = 'medium',
    crf,
    preset,
    audioBitrate = '128k',
    videoCodec,
    resolution,
  } = options;

  return new Promise((resolve, reject) => {
    const qualityPreset = config.compression.presets[quality] || config.compression.presets.medium;
    const selectedCrf = crf || qualityPreset.crf;
    const selectedPreset = preset || qualityPreset.preset;
    const selectedCodec = videoCodec || config.compression.codecs[codec] || config.compression.codecs.h264;

    let command = ffmpeg(inputPath)
      .videoCodec(selectedCodec)
      .outputOptions([
        `-crf ${selectedCrf}`,
        `-preset ${selectedPreset}`,
      ])
      .audioCodec('aac')
      .audioBitrate(audioBitrate);

    // Add resolution if specified
    if (resolution) {
      command = command.size(resolution);
    }

    // Add codec-specific options
    if (selectedCodec === 'libx264' || selectedCodec === 'libx265') {
      command = command.outputOptions(['-movflags', '+faststart']); // Enable progressive playback
    }

    command
      .on('start', (commandLine) => {
        console.log('FFmpeg process started:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('Compression finished successfully');
        resolve({
          success: true,
          outputPath,
          message: 'Video compressed successfully',
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message);
        reject({
          success: false,
          error: err.message,
        });
      })
      .save(outputPath);
  });
};

/**
 * Get video duration in seconds
 */
export const getVideoDuration = async (filePath) => {
  try {
    const metadata = await getVideoInfo(filePath);
    return metadata.format.duration;
  } catch (error) {
    throw new Error(`Failed to get video duration: ${error.message}`);
  }
};

/**
 * Get video file size in bytes
 */
export const getFileSize = async (filePath) => {
  try {
    const metadata = await getVideoInfo(filePath);
    return metadata.format.size;
  } catch (error) {
    throw new Error(`Failed to get file size: ${error.message}`);
  }
};

/**
 * Calculate compression ratio
 */
export const calculateCompressionRatio = (originalSize, compressedSize) => {
  const ratio = ((originalSize - compressedSize) / originalSize) * 100;
  return ratio.toFixed(2);
};

/**
 * Clean up temporary files
 */
export const cleanupFile = async (filePath) => {
  try {
    await unlink(filePath);
    console.log(`Cleaned up file: ${filePath}`);
  } catch (error) {
    console.error(`Failed to cleanup file ${filePath}:`, error.message);
  }
};

/**
 * Generate unique filename
 */
export const generateFilename = (originalName, suffix = 'compressed') => {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}_${suffix}_${timestamp}${ext}`;
};

export default {
  getVideoInfo,
  compressVideo,
  getVideoDuration,
  getFileSize,
  calculateCompressionRatio,
  cleanupFile,
  generateFilename,
};
