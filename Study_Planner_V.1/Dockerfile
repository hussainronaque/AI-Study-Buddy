# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Install http-server globally
RUN npm install -g http-server

# Expose port 8080 for the application
EXPOSE 8080

# Command to run the app
CMD ["http-server", "-p", "8080", "--cors"]