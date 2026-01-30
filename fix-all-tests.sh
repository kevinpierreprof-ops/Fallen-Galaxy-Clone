#!/bin/bash

# Script pour corriger tous les tests backend

echo "🔧 Correction de tous les fichiers de tests..."
echo ""

cd /mnt/c/Fallen\ Galaxy\ clone/space-strategy-game/backend

# Trouver tous les fichiers de tests
TEST_FILES=$(find src -name "*.test.ts" -o -name "*.spec.ts")

COUNT=0

for file in $TEST_FILES; do
    # Vérifier si le fichier contient l'import problématique
    if grep -q "from '@jest/globals'" "$file"; then
        echo "🔧 Correction: $file"
        
        # Supprimer la ligne d'import @jest/globals
        sed -i "/import.*from '@jest\/globals'/d" "$file"
        
        # Supprimer les lignes vides en double qui pourraient être créées
        sed -i '/^$/N;/^\n$/D' "$file"
        
        COUNT=$((COUNT + 1))
    fi
done

echo ""
echo "✅ $COUNT fichiers corrigés"
echo ""
echo "Fichiers traités:"
echo "$TEST_FILES"
