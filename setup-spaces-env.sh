#!/bin/bash

# DigitalOcean Spaces Environment Setup Script
# Copy these values to your backend .env file

cat << 'EOF'
# DigitalOcean Spaces Configuration
DO_SPACES_KEY=blr1
DO_SPACES_SECRET=/BopSX8PXVAYh0Wvky9qyCtmL4WSa6Bk5g0soD3OXCg
DO_SPACES_ENDPOINT=https://mgh.blr1.digitaloceanspaces.com
DO_SPACES_BUCKET=DO009UBNGPNULMBAUMGP
DO_SPACES_REGION=blr1
EOF

echo "Please copy the above DigitalOcean Spaces configuration to your backend .env file"
echo "Location: c:/Users/HP/Desktop/propertyla/propertyla_be/.env"
