# NodeApp/Dockerfile

# Use official Node.js image
FROM node:14

# Set working directory
WORKDIR /usr/src/app 

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install 

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]