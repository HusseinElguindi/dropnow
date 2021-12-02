# # syntax=docker/dockerfile:1

# Base build image
FROM golang:1.16-alpine as build_base

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
COPY client/public/ ../client/public/

# Copy the built binary from the build image to this one
COPY --from=build_base /build/out ./out

# Run the binary
CMD ["./out"]
