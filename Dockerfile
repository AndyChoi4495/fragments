# Stage 1: Build stage
FROM node:18.13.0 AS builder

LABEL maintainer="Yunseok Choi <ychoi65@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci

# Copy src to /app/src/ and other necessary files
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Stage 2: Run stage
FROM node:18.13.0

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the node_modules from the builder stage
COPY --from=builder /app/node_modules /app/node_modules

# Copy the rest of the application from the builder stage
COPY --from=builder /app/src /app/src
COPY --from=builder /app/tests/.htpasswd /app/tests/.htpasswd

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080
