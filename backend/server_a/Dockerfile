# This is where you define the image for
# the server A.

# You should use Node image from Docker Hub as the basis.

#FROM node:version...

#WORKDIR ?

#COPY ?

# RUN ?

#COPY . .

#CMD [??]

FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 8080
CMD ["node", "index.js"]