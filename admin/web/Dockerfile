FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies and ensure next is executable
RUN npm install && \
    chmod +x node_modules/.bin/next

# Copy the rest of the application
COPY . .

# Set correct permissions
RUN chown -R node:node /app && \
    chmod -R 755 /app

# Switch to non-root user
USER node

# Build the Next.js app
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
