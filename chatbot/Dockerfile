# chatbot/Dockerfile

# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json & package-lock.json first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy rest of the application code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
