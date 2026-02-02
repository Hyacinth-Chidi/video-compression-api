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

# Set default port
ARG PORT=5500
ENV PORT=$PORT

# Expose port
EXPOSE $PORT

# Start server
CMD ["npm", "start"]
