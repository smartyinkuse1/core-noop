# Base image
FROM node:16-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

COPY certs /usr/src/app/certs

# Build the TypeScript code
RUN npm run build

# Expose the port
EXPOSE 3000 5000

# Command to run the app
CMD ["node", "dist/server.js"]