#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Create deployment directory if it doesn't exist
ssh root@164.90.210.110 'mkdir -p /var/www/mars-project'

# Copy files to server
echo "Copying files to server..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' ./ root@164.90.210.110:/var/www/mars-project/

# Install dependencies and start the application on the server
echo "Installing dependencies and starting the application..."
ssh root@164.90.210.110 'cd /var/www/mars-project && npm install && npm run build && pm2 start npm --name "mars-project" -- start && pm2 save && pm2 startup' 