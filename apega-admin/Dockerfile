FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy pre-built dist and server
COPY dist ./dist
COPY server.js ./

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
