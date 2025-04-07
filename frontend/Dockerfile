# frontend/Dockerfile

#Some implementation ideas provided below, but feel free to use your own.

#FROM nginx:alpine

#COPY . /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
RUN apk add --no-cache wget
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]