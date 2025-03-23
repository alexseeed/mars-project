#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Certbot and Nginx plugin
apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
systemctl stop nginx

# Get SSL certificate
certbot certonly --standalone -d app.agentur-consulting.de --agree-tos --email your-email@example.com

# Copy Nginx configuration
cp nginx.conf /etc/nginx/sites-available/app.agentur-consulting.de
ln -s /etc/nginx/sites-available/app.agentur-consulting.de /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start Nginx
systemctl start nginx

# Set up auto-renewal
echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

echo "SSL setup complete! Your site should now be accessible at https://app.agentur-consulting.de" 