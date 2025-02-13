FROM node:18-alpine

WORKDIR /app


RUN apk add --no-cache libc6-compat

# Copy package files first
COPY package*.json ./

RUN npm ci

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
