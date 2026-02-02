FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Create uploads directories if they don't exist
RUN mkdir -p uploads compressed

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
