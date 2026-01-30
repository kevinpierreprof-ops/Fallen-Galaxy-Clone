#!/bin/bash

# Diagnostic et Correction des Tests Backend

echo "🔍 Diagnostic des Tests Backend..."
echo ""

cd /mnt/c/Fallen\ Galaxy\ clone/space-strategy-game

# 1. Vérifier que Docker tourne
echo "1️⃣ Vérification Docker..."
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker fonctionne"
else
    echo "❌ Docker ne fonctionne pas"
    exit 1
fi

# 2. Vérifier que backend tourne
echo ""
echo "2️⃣ Vérification Backend..."
BACKEND_STATUS=$(docker ps --filter "name=space-game-backend" --format "{{.Status}}")
if [ -z "$BACKEND_STATUS" ]; then
    echo "⚠️  Backend arrêté, démarrage..."
    docker-compose -f docker-compose.dev.yml up -d backend
    sleep 10
fi
echo "✅ Backend: $BACKEND_STATUS"

# 3. Vérifier les dépendances
echo ""
echo "3️⃣ Vérification dépendances..."
docker-compose -f docker-compose.dev.yml exec -T backend sh -c "ls node_modules/@types/jest > /dev/null 2>&1" && echo "✅ @types/jest installé" || echo "❌ @types/jest manquant"
docker-compose -f docker-compose.dev.yml exec -T backend sh -c "ls node_modules/ts-jest > /dev/null 2>&1" && echo "✅ ts-jest installé" || echo "❌ ts-jest manquant"
docker-compose -f docker-compose.dev.yml exec -T backend sh -c "ls node_modules/supertest > /dev/null 2>&1" && echo "✅ supertest installé" || echo "❌ supertest manquant"

# 4. Lancer les tests avec détails
echo ""
echo "4️⃣ Exécution des tests..."
echo "============================================"
docker-compose -f docker-compose.dev.yml exec -T backend npm test -- --verbose --no-coverage 2>&1 | head -150

echo ""
echo "============================================"
echo "Diagnostic terminé"
