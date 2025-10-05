# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend(node)/package*.json ./backend(node)/

# Install dependencies
RUN npm install
RUN cd backend(node) && npm install

# Copy source code
COPY . .

# Build the backend
RUN cd backend(node) && npm run build

# Expose port
EXPOSE 3000

# Set environment variable
ENV PORT=3000

# Start the backend
CMD ["sh", "-c", "cd backend(node) && npm start"]
