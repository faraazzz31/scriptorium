# Base image
FROM ubuntu:22.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Add necessary repositories
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    software-properties-common

# Add repos for Kotlin
RUN wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | apt-key add -
RUN echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list

# Setup NodeSource repository for Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install necessary packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    nodejs \
    g++ \
    gcc \
    ruby \
    golang-go \
    kotlin \
    php \
    && rm -rf /var/lib/apt/lists/*

# Install TypeScript and ts-node globally
RUN npm install -g typescript@latest ts-node@latest

# Create non-root user
RUN useradd -m runner
RUN mkdir -p /app/workspace
RUN chown -R runner:runner /app

# Install build essentials for compilation
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Set up workspace
WORKDIR /app

# Give runner user necessary permissions
RUN chown -R runner:runner /app
RUN chmod -R 755 /app

# Switch to non-root user
USER runner

# Command to keep container running
CMD ["tail", "-f", "/dev/null"]