# This is where you define the image for
# the server B which processes the orders.

# ou should then use Noje image from Docker Hub as the basis,
# and then follow the instructions linked to in assignment document.
# You should be able to produce a working installation by just
# following the instructions.

# Use Node.js 18 as the base image
# FROM node:18

# Create app directory

# Install app dependencies
# COPY package*.json ./

# Install dependencies
# RUN npm install

# # Bundle app source
# COPY . .

# Expose the port the app runs on
# EXPOSE 3001

# Command to run the application
# CMD [ "node", "index.js" ]


# Dockerfile for Server B
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]