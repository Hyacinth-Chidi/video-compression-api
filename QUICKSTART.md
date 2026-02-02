# 🚀 Quick Start Guide

## Get Up and Running in 3 Steps

### Step 1: Install FFmpeg

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
Download from https://ffmpeg.org/download.html

### Step 2: Install Dependencies

```bash
cd video-compression-api
npm install
```

### Step 3: Start the Server

```bash
npm start
```

That's it! The API is now running at http://localhost:3000

## Test It Out

### Option 1: Open the Demo Page
Open `demo.html` in your browser to test the API with a nice UI

### Option 2: Use cURL
```bash
curl -X POST http://localhost:3000/api/compress \
  -F "video=@your-video.mp4" \
  -F "quality=youtube" \
  -F "codec=h264"
```

### Option 3: Test Script
```bash
node test.js path/to/your/video.mp4
```

## 📁 Project Structure

```
video-compression-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Upload middleware
│   ├── routes/          # API routes
│   ├── utils/           # FFmpeg utilities
│   └── server.js        # Main server file
├── uploads/             # Temporary upload storage
├── compressed/          # Compressed videos
├── demo.html            # Browser demo
├── test.js              # API test script
├── package.json         # Dependencies
├── .env                 # Configuration
└── README.md            # Full documentation
```

## 🎯 Key Features

✅ Uses ES modules (import/export)
✅ Multiple quality presets (high, medium, low, youtube, tiktok)
✅ Support for H.264, H.265, VP9 codecs
✅ Real compression statistics
✅ Automatic file cleanup
✅ Production-ready architecture

## 📚 API Endpoints

- `POST /api/compress` - Compress a video
- `POST /api/info` - Get video metadata
- `GET /api/presets` - List available presets
- `GET /download/:filename` - Download compressed video
- `GET /health` - Health check

## 🔧 Customization

Edit `.env` file to change:
- Port number
- Upload size limits
- Default compression settings
- File storage paths

## 💡 Pro Tips

1. **For YouTube**: Use `quality=youtube` and `codec=h264`
2. **For TikTok/Instagram**: Use `quality=tiktok` and `codec=h264`
3. **For maximum compression**: Use `codec=h265` (less compatible)
4. **For best quality**: Use `quality=high` and `preset=slow`

## Need Help?

Check the full `README.md` for detailed documentation and examples!
