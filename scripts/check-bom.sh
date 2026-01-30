#!/bin/bash

# ==============================================================================
# BOM Detection and Removal Script
# ==============================================================================
# Detects and optionally removes BOM (Byte Order Mark) from files
# Usage:
#   ./check-bom.sh                 # Check only
#   ./check-bom.sh --fix           # Remove BOMs automatically
# ==============================================================================

set -e

BOM=$'\xef\xbb\xbf'
FOUND_BOM=0
FIX_MODE=false

# Parse arguments
if [[ "$1" == "--fix" ]]; then
    FIX_MODE=true
fi

echo "🔍 Checking for BOM (Byte Order Mark) in files..."
echo ""

# Files to check
FILES=(
    "backend/package.json"
    "frontend/package.json"
    "package.json"
    "backend/tsconfig.json"
    "frontend/tsconfig.json"
    "shared/tsconfig.base.json"
    "backend/jest.config.js"
    "frontend/vite.config.ts"
)

# Check each file
for file in "${FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        continue
    fi
    
    # Check for BOM
    if [[ -f "$file" ]] && [[ $(head -c 3 "$file") == "$BOM" ]]; then
        echo "❌ BOM found in: $file"
        FOUND_BOM=1
        
        if $FIX_MODE; then
            echo "   🔧 Removing BOM..."
            # Create temp file without BOM
            tail -c +4 "$file" > "${file}.tmp"
            mv "${file}.tmp" "$file"
            echo "   ✅ BOM removed"
        fi
    else
        echo "✅ No BOM in: $file"
    fi
done

echo ""

if [[ $FOUND_BOM -eq 1 ]]; then
    if $FIX_MODE; then
        echo "✅ All BOMs have been removed"
        exit 0
    else
        echo "❌ BOMs detected! Run with --fix to remove them:"
        echo "   ./scripts/check-bom.sh --fix"
        exit 1
    fi
else
    echo "✅ No BOMs detected in any files"
    exit 0
fi
