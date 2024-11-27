# syntax=docker/dockerfile:1

# Use Node version 22.11.0 (or as specified).
ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-alpine

# Set default NODE_ENV to production.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy the package.json and package-lock.json into the container.
COPY package*.json ./

# Install all dependencies (including dev dependencies like nodemon).
RUN npm ci

# Switch to a non-root user for better security.
USER node

# Copy the application source code into the container.
COPY . .

# Copy .env file if necessary.
COPY .env .env

# Expose port 5000 for the application.
EXPOSE 5000

# Run the application with nodemon for development.
CMD ["npx", "nodemon", "app.js"]
