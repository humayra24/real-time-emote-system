FROM node:18
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create videos directory
# RUN mkdir -p /app/videos

VOLUME /app/videos

# Expose port (if needed)
EXPOSE 3002

# Command to run the application
CMD ["node", "index.js"]