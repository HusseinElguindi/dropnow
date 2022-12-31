# syntax=docker/dockerfile:1

# Base build image for Node
FROM node:16.19-buster-slim AS node_build_base

# Make and switch to the new working directory
WORKDIR /app

# Copy go module files
COPY client/package.json ./
COPY client/package-lock.json ./
# Download dependancies using go modules
RUN npm install

# Copy all node files to the container's work directory
COPY client/. ./

# Build the app
RUN npm run build


# Base build image for Go
FROM golang:1.20rc1-alpine AS go_build_base

# Install git for any tools that require it
RUN apk add --no-cache git

# Make and switch to the new working directory
WORKDIR /source

# Copy go module files
COPY server/go.mod .
COPY server/go.sum .
# Download dependancies using go modules
RUN go mod download

# Copy all go files to the container's work directory
COPY server/*.go .

# Compile the app to a binary
RUN go build -o /build/out


# Start fresh with a lightweight image
FROM alpine:3.15

# Fetch certificates
RUN apk add ca-certificates

# Set working directory
WORKDIR /build

# Move the frontend to the container to be served by the server
# COPY client/public/ ../client/public/ # without node build step
COPY --from=node_build_base /app/public ./client/public

# Copy the built binary from the build image to this one
COPY --from=go_build_base /build/out ./server/out

# Set new working directory (so files are served from the correct path)
WORKDIR /build/server

# Run the binary
CMD ["./out"]
