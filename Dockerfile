# Use official Node.js image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose the port
EXPOSE 3000

# Copy the rest of your application
COPY . .

# Use nodemon to start the application
CMD ["nodemon", "--legacy-watch", "server.js"]
