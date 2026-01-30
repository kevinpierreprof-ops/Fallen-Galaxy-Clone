#!/bin/bash
# ==============================================================================
# Docker Permission Fix Script for WSL
# ==============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Docker Permission Fix for WSL                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "   Please enable WSL Integration in Docker Desktop Settings"
    exit 1
fi

echo "✓ Docker is installed"
echo ""

# Check current permissions
if docker ps &> /dev/null; then
    echo "✅ Docker is already working! No fix needed."
    echo ""
    docker --version
    docker-compose --version
    echo ""
    echo "You can now run: make fix"
    exit 0
fi

echo "⚠️  Docker permission denied detected"
echo ""

# Check if docker group exists
if ! getent group docker &> /dev/null; then
    echo "Creating docker group..."
    sudo groupadd docker
fi

# Add user to docker group
echo "Adding user '$USER' to docker group..."
sudo usermod -aG docker $USER

echo ""
echo "✓ User added to docker group"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  RESTART REQUIRED                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Please run ONE of these commands:"
echo ""
echo "Option 1 (Quick - try this first):"
echo "  newgrp docker"
echo ""
echo "Option 2 (If option 1 doesn't work):"
echo "  In Windows PowerShell: wsl --shutdown"
echo "  Then reopen WSL"
echo ""
echo "After restart, verify with:"
echo "  docker ps"
echo "  make fix"
echo ""
