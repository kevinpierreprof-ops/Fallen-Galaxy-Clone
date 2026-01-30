# Script de nettoyage BOM UTF-8
# Nettoie tous les fichiers du projet

Write-Host "Nettoyage des fichiers BOM UTF-8..." -ForegroundColor Cyan

$rootPath = "C:\Fallen Galaxy clone\space-strategy-game"
Set-Location $rootPath

# Fonction pour nettoyer un fichier (compatible PowerShell 5.x)
function Remove-BOM {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        try {
            $content = Get-Content $FilePath -Raw
            # Enlever le BOM s'il existe
            if ($content.Length -gt 0 -and [int][char]$content[0] -eq 65279) {
                $content = $content.Substring(1)
            }
            # Encoder en UTF8 sans BOM
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($FilePath, $content, $utf8NoBom)
            Write-Host "  ✓ $FilePath" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $FilePath : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n1. Nettoyage des fichiers .env..." -ForegroundColor Yellow
Remove-BOM ".\.env"
Remove-BOM ".\.env.docker"
Remove-BOM ".\backend\.env.example"
Remove-BOM ".\frontend\.env.example"

Write-Host "`n2. Nettoyage des scripts..." -ForegroundColor Yellow
Remove-BOM ".\start.sh"
Remove-BOM ".\stop.sh"
Remove-BOM ".\backup.sh"
Remove-BOM ".\update.sh"
Remove-BOM ".\logs.sh"
Remove-BOM ".\deploy.sh"
Remove-BOM ".\make-executable.sh"

Write-Host "`n3. Nettoyage package.json..." -ForegroundColor Yellow
Remove-BOM ".\package.json"
Remove-BOM ".\frontend\package.json"
Remove-BOM ".\backend\package.json"

Write-Host "`n4. Nettoyage tsconfig..." -ForegroundColor Yellow
Remove-BOM ".\frontend\tsconfig.json"
Remove-BOM ".\frontend\tsconfig.node.json"
Remove-BOM ".\backend\tsconfig.json"
Remove-BOM ".\shared\tsconfig.base.json"

Write-Host "`n5. Nettoyage vite.config.ts..." -ForegroundColor Yellow
Remove-BOM ".\frontend\vite.config.ts"
Remove-BOM ".\frontend\vitest.config.ts"

Write-Host "`n6. Nettoyage docker-compose..." -ForegroundColor Yellow
Remove-BOM ".\docker-compose.yml"
Remove-BOM ".\docker-compose.dev.yml"

Write-Host "`n7. Nettoyage Dockerfile..." -ForegroundColor Yellow
Remove-BOM ".\Dockerfile"
Remove-BOM ".\frontend\Dockerfile"
Remove-BOM ".\frontend\Dockerfile.dev"
Remove-BOM ".\backend\Dockerfile"
Remove-BOM ".\backend\Dockerfile.dev"

Write-Host "`n8. Nettoyage configs..." -ForegroundColor Yellow
Remove-BOM ".\.prettierrc"
Remove-BOM ".\.prettierignore"
Remove-BOM ".\.gitignore"
Remove-BOM ".\frontend\.eslintrc.cjs"
Remove-BOM ".\backend\.eslintrc.js"
Remove-BOM ".\backend\jest.config.js"

Write-Host "`n9. Nettoyage fichiers markdown..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.md" -Recurse | ForEach-Object {
    Remove-BOM $_.FullName
}

Write-Host "`n10. Nettoyage fichiers TypeScript frontend..." -ForegroundColor Yellow
Get-ChildItem -Path ".\frontend\src" -Filter "*.ts" -Recurse | ForEach-Object {
    Remove-BOM $_.FullName
}
Get-ChildItem -Path ".\frontend\src" -Filter "*.tsx" -Recurse | ForEach-Object {
    Remove-BOM $_.FullName
}

Write-Host "`n11. Nettoyage fichiers TypeScript backend..." -ForegroundColor Yellow
Get-ChildItem -Path ".\backend\src" -Filter "*.ts" -Recurse | ForEach-Object {
    Remove-BOM $_.FullName
}

Write-Host "`n12. Nettoyage fichiers TypeScript shared..." -ForegroundColor Yellow
Get-ChildItem -Path ".\shared" -Filter "*.ts" -Recurse | ForEach-Object {
    Remove-BOM $_.FullName
}

Write-Host "`n13. Nettoyage fichiers CSS..." -ForegroundColor Yellow
Get-ChildItem -Path ".\frontend\src" -Filter "*.css" -Recurse | ForEach-Object {
    Remove-BOM $_.FullName
}

Write-Host "`n14. Nettoyage index.html..." -ForegroundColor Yellow
Remove-BOM ".\frontend\index.html"

Write-Host "`n✓ Nettoyage terminé!" -ForegroundColor Green
Write-Host "`nRedémarrage des containers..." -ForegroundColor Cyan

# Redémarrer les containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build

Write-Host "`n✓ Tout est prêt!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
