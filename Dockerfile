# Stage 1: Build stage
FROM node:20.9.0 AS builder

LABEL maintainer="Yunseok Choi <ychoi65@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=${PORT}

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci

# Copy src to /app/src/ and other necessary files
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Stage 2: Run stage
FROM node:20.9.0

# We default to use port 8080 in our service
ENV PORT=${PORT}

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Copy the node_modules from the builder stage
COPY --from=builder /app/node_modules /app/node_modules

# Copy the rest of the application from the builder stage
COPY --from=builder /app/src /app/src
COPY --from=builder /app/tests/.htpasswd /app/tests/.htpasswd

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080


HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl --fail http://localhost:8080/ || exit 1