FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy app source
COPY . .

# Build (compile TypeScript and bundle client)
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
