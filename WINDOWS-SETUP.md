# Ã°Å¸ÂªÅ¸ Guide de DÃƒÂ©marrage Windows

## Installation Rapide (Choisissez une option)

### Option 1: WSL (Ã¢Â­Â RECOMMANDÃƒâ€°)

```powershell
# 1. Installer WSL (PowerShell Admin)
wsl --install

# 2. RedÃƒÂ©marrer Windows

# 3. Ouvrir "Ubuntu" ou "WSL"

# 4. Aller au projet
cd /mnt/c/Users/VotreNom/space-strategy-game

# 5. Lancer
make fix
```

### Option 2: Git Bash (Ã¢Å¡Â¡ RAPIDE)

```powershell
# 1. TÃƒÂ©lÃƒÂ©charger Git for Windows
# https://git-scm.com/download/win

# 2. Installer avec les options par dÃƒÂ©faut

# 3. Ouvrir "Git Bash"

# 4. Aller au projet
cd /c/Users/VotreNom/space-strategy-game

# 5. Lancer
make fix
```

### Option 3: PowerShell + Chocolatey

```powershell
# 1. PowerShell en Administrateur

# 2. Installer Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# 3. Installer Make
choco install make

# 4. RedÃƒÂ©marrer PowerShell

# 5. Aller au projet
cd C:\Users\VotreNom\space-strategy-game

# 6. Lancer
make fix
```

## Ã°Å¸Å¡â‚¬ Commandes Principales

```bash
make help       # Liste toutes les commandes
make fix        # Ã°Å¸â€Â§ TOUT RÃƒâ€°PARER (utilisez ÃƒÂ§a en premier!)
make status     # Voir l'ÃƒÂ©tat des conteneurs
make logs       # Voir tous les logs
make backend    # Voir les logs backend
make stop       # ArrÃƒÂªter
make restart    # RedÃƒÂ©marrer rapidement
```

## Ã°Å¸Å½Â¯ DÃƒÂ©marrage Rapide (AprÃƒÂ¨s Installation)

```bash
# Dans WSL, Git Bash, ou PowerShell avec Make:

cd space-strategy-game
make fix
```

Attendez 2-3 minutes, puis ouvrez:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## Ã°Å¸â€ Ëœ ProblÃƒÂ¨mes Courants

### "make: command not found"
- **WSL**: `sudo apt-get update && sudo apt-get install make`
- **Git Bash**: RÃƒÂ©installez Git for Windows
- **PowerShell**: RÃƒÂ©installez avec `choco install make`

### "docker: command not found"
1. Installez Docker Desktop for Windows
2. DÃƒÂ©marrez Docker Desktop
3. Attendez que Docker soit prÃƒÂªt (icÃƒÂ´ne systÃƒÂ¨me)

### "echo -e: not recognized"
- Vous ÃƒÂªtes dans CMD, utilisez **PowerShell**, **Git Bash**, ou **WSL**

### Ports dÃƒÂ©jÃƒÂ  utilisÃƒÂ©s (3000, 5173, 5432)
```bash
make kill    # Force kill tous les conteneurs
make fix     # Relancer
```

## Ã°Å¸â€œâ€¹ VÃƒÂ©rification Installation

```bash
# VÃƒÂ©rifier que tout est installÃƒÂ©
make doctor
```

## Ã°Å¸â€â€ž Workflow Quotidien

```bash
# Le matin
make start

# Pendant le dev
make backend    # Voir les logs en temps rÃƒÂ©el
make status     # VÃƒÂ©rifier l'ÃƒÂ©tat

# Le soir
make stop
```

## Ã°Å¸â€™Â¡ Astuces Windows

1. **Utilisez Windows Terminal** (plus moderne que CMD)
2. **Docker Desktop doit tourner** avant d'utiliser Make
3. **WSL est plus rapide** que Git Bash pour Docker
4. **Ãƒâ€°pinglez Git Bash/WSL** ÃƒÂ  la barre des tÃƒÂ¢ches

## Ã°Å¸Å½Â® AccÃƒÂ¨s ÃƒÂ  l'Application

AprÃƒÂ¨s `make fix` ou `make start`:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Interface du jeu |
| Backend API | http://localhost:3000 | API REST |
| Backend Health | http://localhost:3000/health | VÃƒÂ©rifier que le backend fonctionne |
| PgAdmin | http://localhost:5050 | Gestion base de donnÃƒÂ©es |

## Ã°Å¸â€œÅ¡ Documentation ComplÃƒÂ¨te

- `make help` - Liste complÃƒÂ¨te des commandes
- `README.md` - Documentation gÃƒÂ©nÃƒÂ©rale
- `DOCKER-QUICKREF.md` - RÃƒÂ©fÃƒÂ©rence Docker

---

**Besoin d'aide?** Tapez `make help` ou `make doctor` pour diagnostiquer les problÃƒÂ¨mes.
