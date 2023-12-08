# Use the same or compatible version as your development environment
FROM node:latest

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including 'devDependencies'
RUN npm install

# Copy the rest of the app
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 3030

# Use nodemon for development to restart the app on file changes
CMD ["node", "./dist/server.js"]
