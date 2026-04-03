# syntax=docker/dockerfile:1
# escape=\
# Base
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code
COPY . .
RUN npm run build
# Expose the port the app runs on
EXPOSE 3005
# Run the application
CMD ["npm", "start"]
