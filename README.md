# Video Compression API

A professional Node.js backend API for high-quality video compression using FFmpeg. Perfect for applications that need to compress videos while maintaining excellent quality, similar to TikTok and YouTube.

## Features

- ✅ High-quality video compression with minimal quality loss
- ✅ Multiple compression presets (high, medium, low, youtube, tiktok)
- ✅ Support for multiple codecs (H.264, H.265, VP9)
- ✅ Custom compression settings (CRF, preset, bitrate)
- ✅ Video metadata extraction
- ✅ Progressive upload support
- ✅ Automatic file cleanup
- ✅ RESTful API
- ✅ Built with ES modules (import/export)

## Prerequisites

- Node.js 16+
- FFmpeg installed on your system

### Install FFmpeg

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**

```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Installation

1. Clone or download this project

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Edit `.env` file if needed (default settings work out of the box)

4. Start the server:

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Running with Docker

1. **Build and start container:**

```bash
docker-compose up -d --build
```

2. **Check logs:**

```bash
docker-compose logs -f
```

3. **Stop container:**

```bash
docker-compose down
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. Compress Video

**POST** `/api/compress`

Compress a video file with customizable quality settings.

**Parameters (multipart/form-data):**

- `video` (required): Video file to compress
- `quality` (optional): Compression quality preset
  - Options: `high`, `medium`, `low`, `youtube`, `tiktok`
  - Default: `medium`
- `codec` (optional): Video codec to use
  - Options: `h264`, `h265`, `vp9`
  - Default: `h264`
- `crf` (optional): Constant Rate Factor (0-51)
  - Lower = better quality, larger file
  - Overrides quality preset
- `preset` (optional): Encoding speed preset
  - Options: `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`
- `audioBitrate` (optional): Audio bitrate (e.g., `128k`, `192k`)
  - Default: `128k`
- `resolution` (optional): Output resolution (e.g., `1280x720`, `1920x1080`)
- `keepOriginal` (optional): Keep the original uploaded file
  - Default: `false`

**Example using cURL:**

```bash
curl -X POST http://localhost:3000/api/compress \
  -F "video=@your-video.mp4" \
  -F "quality=youtube" \
  -F "codec=h264"
```

**Example using JavaScript (Fetch API):**

```javascript
const formData = new FormData();
formData.append("video", fileInput.files[0]);
formData.append("quality", "youtube");
formData.append("codec", "h264");

const response = await fetch("http://localhost:3000/api/compress", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result);
```

**Response:**

```json
{
  "success": true,
  "message": "Video compressed successfully",
  "data": {
    "originalFile": {
      "name": "video.mp4",
      "size": 52428800,
      "sizeFormatted": "50 MB",
      "duration": 120.5
    },
    "compressedFile": {
      "name": "video_compressed_1234567890.mp4",
      "size": 15728640,
      "sizeFormatted": "15 MB",
      "downloadUrl": "/download/video_compressed_1234567890.mp4"
    },
    "compression": {
      "ratio": "70.00%",
      "savedBytes": 36700160,
      "savedFormatted": "35 MB"
    },
    "settings": {
      "quality": "youtube",
      "codec": "h264",
      "crf": 21,
      "preset": "medium"
    }
  }
}
```

### 2. Get Video Info

**POST** `/api/info`

Get metadata and information about a video file.

**Parameters (multipart/form-data):**

- `video` (required): Video file

**Example:**

```bash
curl -X POST http://localhost:3000/api/info \
  -F "video=@your-video.mp4"
```

### 3. Get Available Presets

**GET** `/api/presets`

Get list of available compression presets and codecs.

**Example:**

```bash
curl http://localhost:3000/api/presets
```

**Response:**

```json
{
  "success": true,
  "data": {
    "presets": {
      "high": {
        "crf": 18,
        "preset": "slow",
        "description": "Highest quality, larger file"
      },
      "medium": {
        "crf": 23,
        "preset": "medium",
        "description": "Balanced quality and size"
      },
      "low": {
        "crf": 28,
        "preset": "fast",
        "description": "Lower quality, smallest file"
      },
      "youtube": {
        "crf": 21,
        "preset": "medium",
        "description": "YouTube recommended"
      },
      "tiktok": {
        "crf": 23,
        "preset": "fast",
        "description": "TikTok optimized"
      }
    },
    "codecs": ["h264", "h265", "vp9"]
  }
}
```

### 4. Download Compressed Video

**GET** `/download/{filename}`

Download a compressed video file.

**Example:**

```bash
curl -O http://localhost:3000/download/video_compressed_1234567890.mp4
```

### 5. Health Check

**GET** `/health`

Check if the API is running.

## Understanding Compression Settings

### CRF (Constant Rate Factor)

- Range: 0-51
- **Lower = Better Quality** (but larger file size)
- Recommended values:
  - 18-20: Very high quality (visually lossless)
  - 21-23: High quality (recommended for most uses)
  - 24-28: Medium quality
  - 28+: Lower quality

### Presets (Encoding Speed)

- `ultrafast` to `veryslow`: Trade encoding speed for file size
- Slower presets = better compression (smaller files) but take longer
- Recommended: `medium` for balanced speed and efficiency

### Codecs

- **H.264 (libx264)**: Best compatibility, works everywhere
- **H.265 (libx265)**: 40-50% better compression, less compatible
- **VP9 (libvpx-vp9)**: Good for web, free codec

## Quality Recommendations

**For YouTube/Vimeo:**

```javascript
{
  quality: 'youtube',  // or crf: 21
  codec: 'h264',
  preset: 'medium'
}
```

**For TikTok/Instagram:**

```javascript
{
  quality: 'tiktok',  // or crf: 23
  codec: 'h264',
  preset: 'fast',
  resolution: '1080x1920'  // vertical video
}
```

**For Maximum Quality:**

```javascript
{
  quality: 'high',  // or crf: 18
  codec: 'h264',
  preset: 'slow'
}
```

**For Maximum Compression:**

```javascript
{
  quality: 'low',  // or crf: 28
  codec: 'h265',
  preset: 'fast'
}
```

## Client-Side Example (React)

```javascript
import { useState } from "react";

function VideoCompressor() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("quality", "youtube");
    formData.append("codec", "h264");

    try {
      const response = await fetch("http://localhost:3000/api/compress", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleCompress} disabled={loading}>
        {loading ? "Compressing..." : "Compress Video"}
      </button>

      {result?.success && (
        <div>
          <p>Compression saved: {result.data.compression.ratio}</p>
          <a
            href={`http://localhost:3000${result.data.compressedFile.downloadUrl}`}
            download
          >
            Download Compressed Video
          </a>
        </div>
      )}
    </div>
  );
}

export default VideoCompressor;
```

## Production Considerations

1. **File Storage**: Store compressed videos in cloud storage (AWS S3, Google Cloud Storage)
2. **Queue System**: Use Redis/Bull for processing queue to handle multiple requests
3. **Progress Tracking**: Implement WebSocket for real-time compression progress
4. **Cleanup**: Set up cron job to delete old files
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Authentication**: Add JWT or API key authentication
7. **HTTPS**: Use HTTPS in production
8. **Load Balancing**: Use PM2 or cluster mode for multiple instances

## Troubleshooting

**FFmpeg not found:**

- Make sure FFmpeg is installed and in your system PATH
- Update FFmpeg paths in `.env` file

**File upload size limit:**

- Adjust `MAX_FILE_SIZE` in `.env`
- Also configure your reverse proxy (nginx, apache) upload limits

**Out of memory:**

- Process large videos in smaller batches
- Increase Node.js memory: `node --max-old-space-size=4096 src/server.js`

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
