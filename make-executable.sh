#!/bin/bash

# Make all deployment scripts executable

chmod +x start.sh
chmod +x stop.sh
chmod +x backup.sh
chmod +x update.sh
chmod +x logs.sh
chmod +x deploy.sh

echo "✓ All deployment scripts are now executable"
echo ""
echo "Available scripts:"
echo "  ./start.sh   - Start the application"
echo "  ./stop.sh    - Stop all containers"
echo "  ./backup.sh  - Backup database and data"
echo "  ./update.sh  - Update application with zero downtime"
echo "  ./logs.sh    - View container logs"
echo "  ./deploy.sh  - Universal deployment script"
